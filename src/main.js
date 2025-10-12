import { heartPath, starPath } from './icons.js';
import { routeWaypoints, slideshowCoords } from './route.js';
import { mountSlideShow } from './polaroidSlideshow.js';

const topojson_url = "data/states-10m.json";
const width = 850, height = 500;
const line_color = "#E9ADA2", map_color = "#BFBFBF", city_color = "#C07C88", text_color = "#464646";
const primary_color = "#BC292D", secondary_color = "#97AAAE";
const nyc_color = "#F2CA44", fargo_color = "#E05E58";
const font_name = "Honk";
const font_family = `${font_name}, sans-serif`

const svg = d3.select("#us-map")
  .attr("width", width)
  .attr("height", height);

const projection = d3.geoAlbersUsa()
  .scale(1000)
  .translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

const cities = [
  { name: "Fargo", coords: [-96.7898, 46.8772] },
  { name: "NYC", coords: [-74.0060, 40.7128] }
];

d3.json(topojson_url).then(function(us) {

  ////////////////////////////////////
  //       Get Data & Draw Map      //
  ////////////////////////////////////

  // Get TopoJSON geometries (not features!)
  const stateObjects = us.objects.states.geometries
  .filter(d => d.id !== "02" && d.id !== "15");

  // Merge geometries using TopoJSON
  const contiguous = topojson.merge(us, stateObjects);

  // Now render as one outline
  svg.append("path")
    .datum({type: "Feature", geometry: contiguous})
    .attr("d", path)
    .attr("fill", map_color)
    .attr("stroke", map_color)
    .attr("stroke-width", 3);
        
    // Project city coordinates
  cities.forEach(city => {
    city.pixel = projection(city.coords);
  });

  ////////////////////////////////////
  //          Icon Labels           //
  ////////////////////////////////////

  // Define offsets for each city label
  const nyc_x_offset = -28;
  const nyc_y_offset = -20;
  const fargo_x_offset = -48;
  const fargo_y_offset = -18;

  // Add city labels with respective offsets
  // svg.selectAll("text.city-label")
  //   .data(cities)
  //   .enter()
  //   .append("text")
  //   .attr("class", "city-label")
  //   .attr("x", d => {
  //     if (d.name === "NYC") return d.pixel[0] + nyc_x_offset;
  //     if (d.name === "Fargo") return d.pixel[0] + fargo_x_offset;
  //     return d.pixel[0]; // fallback
  //   })
  //   .attr("y", d => {
  //     if (d.name === "NYC") return d.pixel[1] + nyc_y_offset;
  //     if (d.name === "Fargo") return d.pixel[1] + fargo_y_offset;
  //     return d.pixel[1]; // fallback
  //   })
  //   .text(d => d.name.toUpperCase())
  //   .attr("font-family", font_family)
  //   .attr("font-size", "18px")
  //   .attr("fill", text_color)
  //   .attr("font-weight", "bold")
  //   .attr("alignment-baseline", "middle");

  ////////////////////////////////////
  //          Dashed Route          //
  ////////////////////////////////////

  // Draw and Animate Curved Route
  const projectedRoute = routeWaypoints.map(projection);
  const routeLine = d3.line()
    .x(d => d[0])
    .y(d => d[1])
    .curve(d3.curveBasis);
  // Calculate dash positions along the path
  const dashLength = 10;
  const gapLength = 8;
  const tempPath = svg.append("path")
    .attr("d", routeLine(projectedRoute))
    .attr("fill", "none")
    .attr("stroke", "none"); // invisible, just for calculations

  const totalLength = tempPath.node().getTotalLength();
  const numDashes = Math.floor(totalLength / (dashLength + gapLength));
  const dashPositions = [];
  for (let i = 0; i < numDashes; i++) {
    const start = i * (dashLength + gapLength);
    const end = start + dashLength;
    const p1 = tempPath.node().getPointAtLength(start);
    const p2 = tempPath.node().getPointAtLength(end);
    dashPositions.push({p1, p2});
  }
  tempPath.remove();

  // Render all dashes in base color
  svg.selectAll(".route-dash")
    .data(dashPositions)
    .enter()
    .append("line")
    .attr("class", "route-dash")
    .attr("x1", d => d.p1.x)
    .attr("y1", d => d.p1.y)
    .attr("x2", d => d.p2.x)
    .attr("y2", d => d.p2.y)
    .attr("stroke", line_color)
    .attr("stroke-width", 6)
    .attr("opacity", 1);

  // Parameters for highlights
  const highlight_color = nyc_color; // NYC highlight
  const fargo_highlight = fargo_color; // Fargo highlight
  const overlap_color = secondary_color; // Third color for overlap (choose as you like)
  const numHighlights = 2;
  const numHighlightSets = 3;
  const setOffset = Math.floor(numDashes / 2); // Halfway

  // Create highlight lines for LTR (left-to-right)
  const highlightLines = svg.selectAll(".route-highlight")
    .data(new Array(numHighlights * numHighlightSets).fill(0))
    .enter()
    .append("line")
    .attr("class", "route-highlight")
    .attr("stroke-width", 6)
    .attr("opacity", 1);

  // Create highlight lines for RTL (right-to-left)
  const highlightLinesRL = svg.selectAll(".route-highlight-rl")
    .data(new Array(numHighlights * numHighlightSets).fill(0))
    .enter()
    .append("line")
    .attr("class", "route-highlight-rl")
    .attr("stroke-width", 6)
    .attr("opacity", 1);

  let highlightIndex = 0;
  let highlightIndexRL = numDashes - numHighlights;

  // Initialize each highlight set's index independently
  const ltrIndicesArr = new Array(numHighlightSets)
    .fill(0)
    .map((_, i) => i * Math.floor(numDashes / numHighlightSets));

  const rtlIndicesArr = new Array(numHighlightSets)
    .fill(0)
    .map((_, i) => numDashes - 1 - i * Math.floor(numDashes / numHighlightSets));

  d3.interval(() => {
    // LEFT TO RIGHT sets
    for (let set = 0; set < numHighlightSets; set++) {
      const setBase = set * numHighlights;
      // For this set, get the indices of the highlights
      const ltrIndices = [];
      for (let i = 0; i < numHighlights; i++) {
        ltrIndices.push((ltrIndicesArr[set] + i) % numDashes);
      }
      // Draw highlights for this set
      ltrIndices.forEach((idx, i) => {
        // Check overlap as before
        let isOverlap = false;
        for (let setRL = 0; setRL < numHighlightSets; setRL++) {
          for (let j = 0; j < numHighlights; j++) {
            let idxRL = (rtlIndicesArr[setRL] - j + numDashes) % numDashes;
            if (idxRL === idx) isOverlap = true;
          }
        }
        const d = dashPositions[idx];
        d3.select(highlightLines.nodes()[setBase + i])
          .attr("x1", d.p1.x)
          .attr("y1", d.p1.y)
          .attr("x2", d.p2.x)
          .attr("y2", d.p2.y)
          .attr("stroke", isOverlap ? overlap_color : highlight_color);
      });
      // Advance this set
      ltrIndicesArr[set] = (ltrIndicesArr[set] + 1) % numDashes;
    }

    // RIGHT TO LEFT sets
    for (let set = 0; set < numHighlightSets; set++) {
      const setBase = set * numHighlights;
      const rtlIndices = [];
      for (let i = 0; i < numHighlights; i++) {
        let idx = (rtlIndicesArr[set] - i + numDashes) % numDashes;
        rtlIndices.push(idx);
      }
      rtlIndices.forEach((idx, i) => {
        let isOverlap = false;
        for (let setLTR = 0; setLTR < numHighlightSets; setLTR++) {
          for (let j = 0; j < numHighlights; j++) {
            let idxLTR = (ltrIndicesArr[setLTR] + j) % numDashes;
            if (idxLTR === idx) isOverlap = true;
          }
        }
        const d = dashPositions[idx];
        d3.select(highlightLinesRL.nodes()[setBase + i])
          .attr("x1", d.p1.x)
          .attr("y1", d.p1.y)
          .attr("x2", d.p2.x)
          .attr("y2", d.p2.y)
          .attr("stroke", isOverlap ? overlap_color : fargo_highlight);
      });
      // Advance this set
      rtlIndicesArr[set] = (rtlIndicesArr[set] - 1 + numDashes) % numDashes;
    }
  }, 120); // animation speed

  ////////////////////////////////////
  //          Draw Icons            //
  ////////////////////////////////////

  // Define offsets for icons
  const star_x_offset = 0;
  const star_y_offset = 0;
  const heart_x_offset = 8;
  const heart_y_offset = 8;

  // HEART ICON (Fargo)
  svg.append("path")
    .attr("d", heartPath)
    .attr("transform", `translate(${cities[0].pixel[0]},${cities[0].pixel[1]}) scale(0.4)`)
    .attr("fill", fargo_color)
    .attr("stroke", text_color)
    .attr("stroke-width", 1)
    .style("cursor", "pointer")
    .on("click", () => window.open("https://link-for-fargo.com", "_blank"))
    .on("mouseover", function() {
      d3.select(this)
        .transition().duration(150)
        .attr("transform", `translate(${(cities[0].pixel[0] - heart_x_offset)},${(cities[0].pixel[1] - heart_y_offset)}) scale(0.55)`)
      })
    .on("mouseout", function() {
      d3.select(this)
        .transition().duration(150)
        .attr("transform", `translate(${cities[0].pixel[0]},${cities[0].pixel[1]}) scale(0.4)`)
      });

  // STAR ICON (NYC)
  svg.append("path")
    .attr("class", "nyc-star")
    .attr("d", starPath)
    .attr("transform", `translate(${cities[1].pixel[0]},${cities[1].pixel[1]}) scale(1.5)`)
    .attr("fill", nyc_color)
    .attr("stroke", text_color)
    .attr("stroke-width", .5)
    .style("cursor", "pointer")
    .on("click", () => window.open("https://link-for-nyc.com", "_blank"))
    .on("mouseover", function() {
      d3.select(this)
        .transition().duration(150)
        .attr("transform", `translate(${(cities[1].pixel[0] - star_x_offset)},${(cities[1].pixel[1] - star_y_offset)}) scale(2.1)`)
    })
    .on("mouseout", function() {
      d3.select(this)
        .transition().duration(150)
        .attr("transform", `translate(${cities[1].pixel[0]},${cities[1].pixel[1]}) scale(1.5)`)
    });

    ///////////////////////////
    //     Mount Slideshow   //
    ///////////////////////////
    const slideshowPixel = projection(slideshowCoords)
    console.log(slideshowPixel)
    mountSlideShow(slideshowPixel)
});

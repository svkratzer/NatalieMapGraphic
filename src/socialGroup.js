export function mountSocialGroup(pixel, scale = 1.0, icons = [
  { name: 'IMDB', color: '#F5C518', secondary: "#f4d35c", link: 'https://imdb.com', img: 'assets/IMDBicon.png' },
  { name: 'Spotify', color: '#1DB954', secondary: "#5ecc85", link: 'https://spotify.com', img: 'assets/SPOTIFYicon.svg' },
  { name: 'Instagram', color: '#E4405F', secondary: "#e0647b", link: 'https://instagram.com', img: 'assets/INSTAGRAMicon.svg' }
]) {
  const container = document.getElementById("social-group");
  container.innerHTML = "";
  container.style.position = 'absolute';
  container.style.left = `${pixel[0]}px`;
  container.style.top = `${pixel[1]}px`;
  container.style.width = `${240 * scale}px`;
  container.style.height = `${120 * scale}px`;
  container.style.zIndex = '20';

  const width = 240 * scale;
  const height = 120 * scale;

  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("overflow", "visible");

  // Initial positions
  const nodes = [
    { id: 0, x: width/3, y: height/2, r: 30*scale , originalR: 30*scale, ...icons[0] },
    { id: 1, x: width/2, y: height/2, r: 30*scale, originalR: 30*scale, ...icons[1] },
    { id: 2, x: 2*width/3, y: height/2, r: 30*scale, originalR: 30*scale, ...icons[2] },
  ];

  // D3 force simulation
  const simulation = d3.forceSimulation(nodes)
    .force("center", d3.forceCenter(width/2, height/2))
    .force("collide", d3.forceCollide().radius(d => d.r + 2).strength(0.7))
    .force("x", d3.forceX(width/2).strength(0.1))
    .force("y", d3.forceY(height/2).strength(0.1))
    .alpha(0.8)
    .alphaDecay(0.03)
    .on("tick", ticked);

  // Draw bubbles
  const groups = svg.selectAll("g.social-icon")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "social-icon")
    .style("cursor", "pointer");

  // Draw circles behind each icon for collision and style
  groups.append("circle")
    .attr("r", d => d.r)
    .attr("fill", d => d.color)
    // .attr("stroke", d => d.secondary)
    .attr("stroke", "#333333")
    .attr("stroke-width", 0.5);

  // Add image for each icon (SVG or PNG)
  groups.append("image")
    .attr("href", d => d.img)
    .attr("width", d => d.r * 1.5)
    .attr("height", d => d.r * 1.5)
    .attr("x", d => -d.r * 0.75)
    .attr("y", d => -d.r * 0.75);

  // Vibration intervals for each icon
  let vibrateIntervals = {};

  groups.on("mouseover", function(e, d) {
    d.r = d.originalR * 1.3;
    d3.select(this).select("circle")
      .transition().duration(150)
      .attr("r", d.r);
  
    d3.select(this).select("image")
      .transition().duration(150)
      .attr("width", d.r * 1.5)
      .attr("height", d.r * 1.5)
      .attr("x", -d.r * 0.75)
      .attr("y", -d.r * 0.75);

    // Start vibration on the image in this group
    const group = d3.select(this);
    const img = group.select("image");
    if (vibrateIntervals[d.id]) clearInterval(vibrateIntervals[d.id]);
    vibrateIntervals[d.id] = setInterval(() => {
      // Small random shake
      const dx = (Math.random() - 0.5) * 4;
      const dy = (Math.random() - 0.5) * 4;
      img
        .attr("x", -d.r * 0.75 + dx)
        .attr("y", -d.r * 0.75 + dy);
    }, 40);
  
    simulation.force("collide").radius(dd => dd.r + 2);
    simulation.alpha(0.7).restart();
  }).on("mouseout", function(e, d) {
    d.r = d.originalR;
    d3.select(this).select("circle")
      .transition().duration(150)
      .attr("r", d.r);
  
    d3.select(this).select("image")
      .transition().duration(150)
      .attr("width", d.r * 1.5)
      .attr("height", d.r * 1.5)
      .attr("x", -d.r * 0.75)
      .attr("y", -d.r * 0.75);

    // Stop vibration and reset image position
    if (vibrateIntervals[d.id]) {
      clearInterval(vibrateIntervals[d.id]);
      vibrateIntervals[d.id] = null;
    }
    const group = d3.select(this);
    const img = group.select("image");
    img
      .attr("x", -d.r * 0.75)
      .attr("y", -d.r * 0.75);
  
    simulation.force("collide").radius(dd => dd.r + 2);
    simulation.alpha(0.7).restart();
  });

  const CLICK_TIME_THRESHOLD = 180; // ms
  let dragStartTime = {};

  // Drag logic with vibration
  groups.call(
    d3.drag()
      .on("start", function(event, d) {
        dragStartTime[d.id] = Date.now();
        simulation.alphaTarget(0.5).restart();
        d.fx = d.x;
        d.fy = d.y;

        // Start vibration on the image in this group
        const group = d3.select(this);
        const img = group.select("image");
        if (vibrateIntervals[d.id]) clearInterval(vibrateIntervals[d.id]);
        vibrateIntervals[d.id] = setInterval(() => {
          // Small random shake
          const dx = (Math.random() - 0.5) * 4;
          const dy = (Math.random() - 0.5) * 4;
          img
            .attr("x", -d.r * 0.75 + dx)
            .attr("y", -d.r * 0.75 + dy);
        }, 40);
      })
      .on("drag", function(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", function(event, d) {
        simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        // Stop vibration and reset image position
        if (vibrateIntervals[d.id]) {
          clearInterval(vibrateIntervals[d.id]);
          vibrateIntervals[d.id] = null;
        }
        const group = d3.select(this);
        const img = group.select("image");
        img
          .attr("x", -d.r * 0.75)
          .attr("y", -d.r * 0.75);

        // Check to see if we should open the link
        const dt = Date.now() - dragStartTime[d.id];
        if (dt < CLICK_TIME_THRESHOLD) {
          window.open(d.link, "_blank");
        }
      })
  );

  function ticked() {
    groups.attr("transform", d => `translate(${d.x},${d.y})`);
  }
}
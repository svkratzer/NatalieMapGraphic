export function mountAnimatedCamera(mapPixel) {
  const CAMERA_SCALE = 0.55; // Change this value for global scale

  const container = document.getElementById("camera-icon");
  container.innerHTML = "";

  // Pin to map coordinates
  container.style.position = 'absolute';
  container.style.left = `${mapPixel[0]}px`;
  container.style.top = `${mapPixel[1]}px`;
  container.style.width = `${(300 * CAMERA_SCALE)}px`;
  container.style.height = `${220 * CAMERA_SCALE}px`;
  container.style.zIndex = '0';
  container.style.cursor = 'pointer';

  // Set up SVG dimensions
  const baseWidth = 300 * CAMERA_SCALE, baseHeight = 220 * CAMERA_SCALE;
  const width = baseWidth;
  const height = baseHeight;
  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("overflow", "visible");

  // Center everything
  const centerX = width / 2;
  const centerY = height / 2 - 10;

  // Camera body
  const bodyWidth = 160, bodyHeight = 60;
  const bodyX = -bodyWidth / 2, bodyY = 0;

  // Lens: move it back so it intersects with body
  // The new points will be closer to the right edge of the body
  const lensStartX = bodyX + bodyWidth - 10; // 70
  const lensStartY = bodyY + bodyHeight / 2; // 30
  const lensPoints = [
    [lensStartX, lensStartY],         // Left base of lens
    [lensStartX + 40, lensStartY - 20], // Top tip
    [lensStartX + 40, lensStartY + 20]  // Bottom tip
  ];

  // Wheels
  const wheelRadius = 42;
  const wheelSpacing = 60;
  const wheelY = -bodyHeight / 2 + 10; // Raise wheels up to be above body

  // Tripod legs: aligned and symmetrical
  const legYStart = bodyY + bodyHeight;
  const legLength = 60;
  const legWidth = 16;

  const legLeftX = bodyX + 10;
  const legRightX = bodyX + bodyWidth - 26;
  const legCenterX = 0;

  // Draw camera group
  const cameraGroup = svg.append("g")
    .attr("class", "camera-group")
    .attr("transform", `translate(${centerX},${centerY}) scale(${CAMERA_SCALE})`);

  // Main body
  cameraGroup.append("rect")
    .attr("x", bodyX)
    .attr("y", bodyY)
    .attr("width", bodyWidth)
    .attr("height", bodyHeight)
    .attr("rx", 14)
    .attr("fill", "black");

  // Lens (polygon, moved back)
  cameraGroup.append("polygon")
    .attr("points", lensPoints.map(p => p.join(",")).join(" "))
    .attr("fill", "#222");

  // Wheels (thicker)
  function drawWheel(g, cx, cy, r) {
    g.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", r)
      .attr("stroke", "black")
      .attr("stroke-width", 7)
      .attr("fill", "white");
    // Thicker blades
    const bladeWidth = 18, bladeLength = 34;
    for (let i = 0; i < 4; ++i) {
      let angle = i * 90;
      g.append("rect")
        .attr("x", cx - bladeWidth / 2)
        .attr("y", cy - bladeLength)
        .attr("width", bladeWidth)
        .attr("height", bladeLength)
        .attr("fill", "#333")
        .attr("transform", `rotate(${angle},${cx},${cy})`);
    }
  }

  const wheel1 = cameraGroup.append("g").attr("class", "wheel").attr("id", "wheel1");
  drawWheel(wheel1, -wheelSpacing, wheelY, wheelRadius);

  const wheel2 = cameraGroup.append("g").attr("class", "wheel").attr("id", "wheel2");
  drawWheel(wheel2, wheelSpacing, wheelY, wheelRadius);

  // Tripod legs (aligned and symmetrical)
  cameraGroup.append("rect")
    .attr("x", legLeftX)
    .attr("y", legYStart)
    .attr("width", legWidth)
    .attr("height", legLength)
    .attr("fill", "#222")
    .attr("rx", 6);

  cameraGroup.append("rect")
    .attr("x", legRightX)
    .attr("y", legYStart)
    .attr("width", legWidth)
    .attr("height", legLength)
    .attr("fill", "#222")
    .attr("rx", 6);

  cameraGroup.append("rect")
    .attr("x", legCenterX - legWidth / 2)
    .attr("y", legYStart)
    .attr("width", legWidth)
    .attr("height", legLength + 10)
    .attr("fill", "#222")
    .attr("rx", 6);

  // Animation logic
  let animating = false;
  let angle = 0;
  let interval = null;
  let speed = 40;

  function animateWheels() {
    if (!animating) return;
    angle = (angle + 6) % 360;
    wheel1.attr("transform", `rotate(${angle},${-wheelSpacing},${wheelY})`);
    wheel2.attr("transform", `rotate(${angle},${wheelSpacing},${wheelY})`);
    interval = setTimeout(animateWheels, speed);
  }

  svg.on("mouseover", function() {
    cameraGroup.transition().duration(180)
      .attr("transform", `translate(${centerX},${centerY}) scale(${CAMERA_SCALE * 1.22})`);
    svg.transition().duration(180)
      // .attr("width", `${(width * CAMERA_SCALE * 1.22)}px`)
      // .attr("height", `${(height * CAMERA_SCALE * 1.22)}px`);
    if (interval) clearTimeout(interval);
    speed = 15;
    animating = true;
    animateWheels();
  });

  svg.on("mouseout", function() {
    cameraGroup.transition().duration(180)
      .attr("transform", `translate(${centerX},${centerY}) scale(${CAMERA_SCALE})`);
    svg.transition().duration(180)
      // .attr("width", `${(width * CAMERA_SCALE * 1.22)}px`)
      // .attr("height", `${(height * CAMERA_SCALE * 1.22)}px`);
    if (interval) clearTimeout(interval);
    speed = 40;
    animating = true;
    animateWheels();
  });

  animating = true;
  animateWheels();
}
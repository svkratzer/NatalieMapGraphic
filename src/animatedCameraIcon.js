export function mountAnimatedCamera(mapPixel) {
  const CAMERA_SCALE = 0.65;

  const container = document.getElementById("camera-icon");
  container.innerHTML = "";

  container.style.position = 'absolute';
  container.style.left = `${mapPixel[0]}px`;
  container.style.top = `${mapPixel[1]}px`;
  container.style.width = `${(300 * CAMERA_SCALE)}px`;
  container.style.height = `${220 * CAMERA_SCALE}px`;
  container.style.zIndex = '0';
  container.style.cursor = 'pointer';

  const baseWidth = 300 * CAMERA_SCALE, baseHeight = 220 * CAMERA_SCALE;
  const width = baseWidth, height = baseHeight;
  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("overflow", "visible");

  const centerX = width / 2;
  const centerY = height / 2 - 10;

  const bodyWidth = 160, bodyHeight = 60;
  const bodyX = -bodyWidth / 2, bodyY = 0;

  // Label settings
  const labelText = "media";
  const labelFontSize = 22;
  const letterSpacing = 22;
  const labelY = bodyY + bodyHeight / 2 + 9; // Vertically centered on body

  // Camera group
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
  const lensStartX = bodyX + bodyWidth - 10;
  const lensStartY = bodyY + bodyHeight / 2;
  const lensPoints = [
    [lensStartX, lensStartY],
    [lensStartX + 40, lensStartY - 20],
    [lensStartX + 40, lensStartY + 20]
  ];
  cameraGroup.append("polygon")
    .attr("points", lensPoints.map(p => p.join(",")).join(" "))
    .attr("fill", "#222");

  // Wheels
  function drawWheel(g, cx, cy, r) {
    g.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", r)
      .attr("stroke", "black")
      .attr("stroke-width", 7)
      .attr("fill", "white");
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
  const wheelRadius = 42, wheelSpacing = 60, wheelY = -bodyHeight / 2 + 10;
  const wheel1 = cameraGroup.append("g").attr("class", "wheel").attr("id", "wheel1");
  drawWheel(wheel1, -wheelSpacing, wheelY, wheelRadius);
  const wheel2 = cameraGroup.append("g").attr("class", "wheel").attr("id", "wheel2");
  drawWheel(wheel2, wheelSpacing, wheelY, wheelRadius);

  // Tripod legs
  const legYStart = bodyY + bodyHeight, legLength = 60, legWidth = 16;
  const legLeftX = bodyX + 10, legRightX = bodyX + bodyWidth - 26, legCenterX = 0;
  cameraGroup.append("rect").attr("x", legLeftX).attr("y", legYStart).attr("width", legWidth).attr("height", legLength).attr("fill", "#222").attr("rx", 6);
  cameraGroup.append("rect").attr("x", legRightX).attr("y", legYStart).attr("width", legWidth).attr("height", legLength).attr("fill", "#222").attr("rx", 6);
  cameraGroup.append("rect").attr("x", legCenterX - legWidth / 2).attr("y", legYStart).attr("width", legWidth).attr("height", legLength + 10).attr("fill", "#222").attr("rx", 6);

  // Add PORTFOLIO label, each letter in its own <tspan>
  const label = cameraGroup.append("text")
    .attr("x", 0)
    .attr("y", labelY)
    .attr("text-anchor", "middle")
    .attr("font-family", "sans-serif")
    .attr("font-weight", "bold")
    .attr("font-size", labelFontSize)
    .attr("fill", "#fff");

  // Calculate spacing for letters (monospaced, centered)
  const startX = -((labelText.length - 1) * letterSpacing) / 2;
  for (let i = 0; i < labelText.length; ++i) {
    label.append("tspan")
      .attr("x", startX + i * letterSpacing)
      .attr("y", labelY)
      .text(labelText[i])
      .attr("class", "letter");
  }

  // Animation logic for wheels
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

  // Label shaking logic
  let letterShakeInterval = null;
  function startLetterShake() {
    if (letterShakeInterval) return;
    const tspans = label.selectAll("tspan");
    letterShakeInterval = setInterval(() => {
      tspans.each(function(_, i) {
        const dx = (Math.random() - 0.5) * 4; // shake range
        const dy = (Math.random() - 0.5) * 4;
        d3.select(this)
          .attr("x", startX + i * letterSpacing + dx)
          .attr("y", labelY + dy);
      });
    }, 60);
  }
  function stopLetterShake() {
    clearInterval(letterShakeInterval);
    letterShakeInterval = null;
    label.selectAll("tspan")
      .each(function(_, i) {
        d3.select(this)
          .attr("x", startX + i * letterSpacing)
          .attr("y", labelY);
      });
  }

  // Mouse events
  svg.on("mouseover", function() {
    cameraGroup.transition().duration(180)
      .attr("transform", `translate(${centerX},${centerY}) scale(${CAMERA_SCALE * 1.22})`);
    if (interval) clearTimeout(interval);
    speed = 15;
    animating = true;
    animateWheels();
    startLetterShake();
  });
  svg.on("mouseout", function() {
    cameraGroup.transition().duration(180)
      .attr("transform", `translate(${centerX},${centerY}) scale(${CAMERA_SCALE})`);
    if (interval) clearTimeout(interval);
    speed = 40;
    animating = true;
    animateWheels();
    stopLetterShake();
  });

  animating = true;
  animateWheels();
}
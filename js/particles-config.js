/**
 * Returns a particles.js config for the right-side zone.
 * The canvas covers the full viewport; CSS clip-path hides the left 50%.
 * color: '#e8dcc8' in dark mode, '#0d1224' in light mode.
 */
window.getParticlesConfig = function(color) {
  return {
    particles: {
      /* 168 spread across full viewport → ~84 visible in the right half */
      number: { value: 168, density: { enable: true, value_area: 900 } },
      color: { value: color },
      shape: { type: 'circle', stroke: { width: 0 } },
      opacity: {
        value: 0.44,
        random: true,
        anim: { enable: true, speed: 0.5, opacity_min: 0.14, sync: false }
      },
      size: { value: 2.6, random: true, anim: { enable: false } },
      line_linked: {
        enable: true,
        distance: 130,
        color: color,
        opacity: 0.16,
        width: 1
      },
      move: {
        enable: true,
        speed: 0.65,
        direction: 'none',
        random: true,
        straight: false,
        out_mode: 'out',
        bounce: false
      }
    },
    interactivity: {
      detect_on: 'window',
      events: {
        onhover: { enable: true, mode: 'grab' },
        onclick:  { enable: true, mode: 'push' },
        resize:   true
      },
      modes: {
        grab:    { distance: 130, line_linked: { opacity: 0.38 } },
        repulse: { distance: 120, duration: 0.4 },
        bubble:  { distance: 160, size: 9, duration: 0.4, opacity: 0.9, speed: 3 },
        push:    { particles_nb: 3 }
      }
    },
    retina_detect: true
  };
};

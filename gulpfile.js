const { src, dest, parallel } = require('gulp');

function buildNodeIcons() {
  // copies icons (svg/png) and codex metadata (*.node.json) next to compiled nodes
  return src('nodes/**/*.{png,svg,json}').pipe(dest('dist/nodes'));
}

function buildCredentialIcons() {
  return src('credentials/**/*.{png,svg}').pipe(dest('dist/credentials'));
}

exports['build:icons'] = parallel(buildNodeIcons, buildCredentialIcons);

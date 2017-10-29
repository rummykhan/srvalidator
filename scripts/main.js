const Rollup = require('rollup');
const Uglify = require('uglify-js');
const flow = require('rollup-plugin-flow');
const fs = require('fs');
const path = require('path');
const buble = require('rollup-plugin-buble');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const replace = require('rollup-plugin-replace');
const chalk = require('chalk');
const version = require('../package.json').version;

const outputFolder = path.join(__dirname, '/../', 'dist');

async function main () {
  console.log(chalk.cyan('Generating main builds...'));
  const bundle = await Rollup.rollup({
    input: 'src/index.js',
    plugins: [
      flow({ pretty: true }),
      replace({ __VERSION__: version }),
      nodeResolve(),
      commonjs(),
      buble()
    ],
  });

  const { code } = await bundle.generate({
    format: 'umd',
    name: 'r-validator',
    banner:
    `/**
 * r-validator v${version}
 * (c) ${new Date().getFullYear()} Rehan Manzoor
 * @license MIT
 */`
  });

  const output = path.join(outputFolder, 'r-validator.js');
  fs.writeFileSync(output, code);
  console.log(chalk.green('Output File:') + ' r-validator.js');
  fs.writeFileSync(path.join(outputFolder, 'r-validator.min.js'), Uglify.minify(code, {
    compress: true,
    mangle: true,
  }).code);
  console.log(chalk.green('Output File:') + ' r-validator.min.js');
}

async function build () {
  try {
    await main();
  } catch (err) {
    console.log(chalk.red(err));
    throw err;
  }
}

build();

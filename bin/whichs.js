#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

let keyword
let include_unexcutable = false
const SEACHED = []
const RESULTS = []
const SUPPORT_WITHFILETYPES = !!fs.readdirSync(__dirname, {withFileTypes: true})[0].isSymbolicLink

main()
function main () {
  keyword = process.argv[2]
  include_unexcutable = process.argv.map(v => v.trim()).some(v => v === '-a')
  if (!keyword) throw new Error('missing keyword')
  const pt = process.env.PATH
  if (!pt) throw new Error('no $PATH found')
  const paths = pt.trim().split(':')
  paths.forEach(dir => {
    dir = expandHomeDir(dir.trim())
    try {
      process_dir(dir)
    } catch (e) {
      // console.error(e)
    }
  })
  RESULTS.forEach((v, i) => {
    const index = i + 1
    const {pt, origin_pt} = v
    if (origin_pt) {
      console.log(index, origin_pt, '->', pt)
    } else {
      console.log(index, pt)
    }
  })
}

function process_dir (dir) {
  if (dir.endsWith('/')) dir = dir.slice(0, -1)
  if (SEACHED.includes(dir)) return
  SEACHED.push(dir)
  let files
  if (SUPPORT_WITHFILETYPES) {
    files = fs.readdirSync(dir, {withFileTypes: true}).map(file => {
      const pt = `${dir}/${file.name}`
      return {pt, name: file.name, is_link: file.isSymbolicLink()}
    })
  } else {
    // for lower version of node which does not support withFileTypes
    files = fs.readdirSync(dir).map(name => {
      const pt = `${dir}/${name}`
      const t = fs.lstatSync(pt)
      return {pt, name, is_link: t.isSymbolicLink()}
    })
  }
  files.forEach(v => {
    try {
      handle_file(v)
    } catch (e) {
      // console.error(e)
    }
  })
}

function handle_file (file) {
  let {pt, name, is_link, origin_pt} = file
  if (is_link) {
    let link = fs.readlinkSync(pt)
    link = path.resolve(pt, '..', link)
    const info = fs.statSync(link)
    return handle_file({
      name,
      pt: link,
      is_link: info.isSymbolicLink(),
      origin_pt: pt
    })
  }
  if ((name === keyword) && (include_unexcutable || excutable(pt))) {
    RESULTS.push({pt, origin_pt})
  }
}

// stole from https://github.com/n-johnson/expand-home-dir/blob/master/index.js
function expandHomeDir (pt) {
  const isWin32 = process.platform == 'win32'
  const homedir = process.env[isWin32 ? 'USERPROFILE' : 'HOME']
  if (!pt) return pt
  pt = pt.trim()
  if (pt === '~') return homedir
  if (pt.slice(0, 2) != '~/') return pt
  return path.join(homedir, pt.slice(2))
}

function excutable (pt) {
  const mode = fs.constants.R_OK | fs.constants.X_OK
  try {
    fs.accessSync(pt, mode)
    return true
  } catch (err) {
    return false
  }
}

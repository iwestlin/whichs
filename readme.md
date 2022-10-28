# whichs

## description
`whichs` is a command line tool to find files in `$PATH`, like the shell built-in commands `which`, but `which` only returns the first result while `whichs` returns all.

## install
> I want to use the `whichs` for npm package name, but while I publishing it, I got 404 error and it wasted me an hour to find out that it's not an authToken issue, you just can not use the `whichs` name😅

```shell
npm i findp -g
```

## usage
```shell
# find all excutable files(or link) in $PATH named node
whichs node

# find all files(or link) in $PATH named node
whichs node -a
```
## screenshot
![](./screenshot.png)

## notice
- `whichs` does not return shell built-in commands like `cd`
- if `whichs` finds a link, it will return the real file's path which the link pointed to.

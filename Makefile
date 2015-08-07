build:
	browserify public/js/main.es6 -t babelify --outfile public/js/build/build.js

watch:
	watchify public/js/main.es6 -v -t babelify -o public/js/build/build.js

prod:
	browserify public/js/main.es6 -t babelify --outfile public/js/build/build.js
	minify public/js/build/build.js > public/js/build/build.min.js
	minify public/css/main.css > public/css/main.min.css

serve:
	serve -p 8555 ./public/

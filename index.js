var path = process.argv[2];

var fs = require('fs'),
    rl = require('readline');

var inputStream   = fs.createReadStream(path),
    inputReadLine = rl.createInterface({input: inputStream, 'output': {}});

var data = [];

const BEGIN = /^BookmarkBegin$/;
const TITLE = /(^BookmarkTitle: )(.*$)/;
const LEVEL = /(^BookmarkLevel: )(.*$)/;
const PGNUM = /(^BookmarkPageNumber: )(.*$)/;

var hierarchize = function(data, lv) {
    var result = [];
    var current;
    var diff;
    var lastLv = lv || 1;

    while (data.length) {
        current = data[0];
        diff = current.level - lastLv;

        if (diff == 0) {
            result.push(data.shift());
        }

        if (diff == 1) {
            result.push(hierarchize(data, current.level));

            if (data.length > 0 && data[0].level == lastLv) {
                continue;
            }
        }

        if (diff < 0) {
            break;
        }

        if (diff > 1) {
            throw new Error('Invalid bookmark hierarchy.');
        }

        lastLv = current.level;
    }

    return result;
};

inputReadLine
    .on('line', function(line) {
        let str;

        if (BEGIN.test(line)) {
            data.push({});
        }

        str = TITLE.exec(line);
        if (str) {
            data[data.length - 1].title = str[2];
        }

        str = LEVEL.exec(line);
        if (str) {
            data[data.length - 1].level = parseInt(str[2], 10);
        }

        str = PGNUM.exec(line);
        if (str) {
            data[data.length - 1].pageNumber = parseInt(str[2], 10);
        }
    })
    .on('close', function() {
        try {
            process.stdout.write(JSON.stringify(hierarchize(data), null, "  "));
        } catch (e) {
            process.stderr.write(e.stack);
        }
    });

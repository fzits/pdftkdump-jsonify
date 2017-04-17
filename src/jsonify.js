const BEGIN = /^BookmarkBegin$/;
const TITLE = /(^BookmarkTitle: )(.*$)/;
const LEVEL = /(^BookmarkLevel: )(.*$)/;
const PGNUM = /(^BookmarkPageNumber: )(.*$)/;

class PdftkdumpJsonify {
    constructor() {
        this.data = [];
    }

    read(line) {
        let str;

        if (BEGIN.test(line)) {
            this.data.push({});
        }

        str = TITLE.exec(line);
        if (str) {
            this.data[this.data.length - 1].title = str[2];
        }

        str = LEVEL.exec(line);
        if (str) {
            this.data[this.data.length - 1].level = parseInt(str[2], 10);
        }

        str = PGNUM.exec(line);
        if (str) {
            this.data[this.data.length - 1].pageNumber = parseInt(str[2], 10);
        }
    }

    write() {
        return JSON.stringify(this.hierarchize(this.data), null, "  ");
    }

    hierarchize(data, lv) {
        let result = [];
        let current;
        let diff;
        let lastLv = lv || 1;

        while (data.length) {
            current = data[0];
            diff = current.level - lastLv;

            if (diff == 0) {
                result.push(data.shift());
            }

            if (diff == 1) {
                result.push(this.hierarchize(data, current.level));

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
    }
}

module.exports = PdftkdumpJsonify;

const PGNUM = 'NumberOfPages';
const BM_BEGIN = 'BookmarkBegin';
const BM_TITLE = 'BookmarkTitle';
const BM_LEVEL = 'BookmarkLevel';
const BM_PGNUM = 'BookmarkPageNumber';

class PdftkdumpJsonify {
    constructor() {
        this.bookmarks = [];

        this.data = {
            NumberOfPages: 0,
            bookmarks: []
        };

        this.regexPageNum = new RegExp(`(^${PGNUM}: )(.*$)`);

        this.regexBM = {
            begin: new RegExp(`^${BM_BEGIN}$`),
            title: new RegExp(`(^${BM_TITLE}: )(.*$)`),
            level: new RegExp(`(^${BM_LEVEL}: )(.*$)`),
            pgnum: new RegExp(`(^${BM_PGNUM}: )(.*$)`)
        };
    }

    read(line) {
        let str;

        str = this.regexPageNum.exec(line);
        if (str) {
            this.data[PGNUM] = str[2];
        }

        if (this.regexBM.begin.test(line)) {
            this.bookmarks.push({});
        }

        str = this.regexBM.title.exec(line);
        if (str) {
            this.bookmarks[this.bookmarks.length - 1][BM_TITLE] = str[2];
        }

        str = this.regexBM.level.exec(line);
        if (str) {
            this.bookmarks[this.bookmarks.length - 1][BM_LEVEL] = parseInt(str[2], 10);
        }

        str = this.regexBM.pgnum.exec(line);
        if (str) {
            this.bookmarks[this.bookmarks.length - 1][BM_PGNUM] = parseInt(str[2], 10);
        }
    }

    write() {
        this.data.bookmarks = this.hierarchizeBookmarks(this.bookmarks);

        return this.data;
    }

    hierarchizeBookmarks(data, lv) {
        let result = [];
        let current;
        let diff;
        let lastLv = lv || 1;

        while (data.length) {
            current = data[0];
            diff = current[BM_LEVEL] - lastLv;

            if (diff == 0) {
                result.push(data.shift());
            }

            if (diff == 1) {
                result.push(this.hierarchizeBookmarks(data, current[BM_LEVEL]));

                if (data.length > 0 && data[0][BM_LEVEL] == lastLv) {
                    continue;
                }
            }

            if (diff < 0) {
                break;
            }

            if (diff > 1) {
                throw new Error('Invalid bookmark hierarchy.');
            }

            lastLv = current[BM_LEVEL];
        }

        return result;
    }
}

module.exports = PdftkdumpJsonify;

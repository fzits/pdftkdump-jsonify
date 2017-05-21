var assert = require('assert');
var Jsonify = require('../src/jsonify');

describe('Read line', function() {
    var j = new Jsonify;
    var lines = [
        'NumberOfPages: 10',
        'BookmarkBegin',
        'BookmarkTitle: TITLE',
        'BookmarkLevel: 1',
        'BookmarkPageNumber: 2'
    ];

    lines.forEach((line, i) => j.read(line));

    it('NumberOfPages', () => {
        assert.equal('10', j.data.NumberOfPages);
    });

    it('BookmarkTitle', () => {
        assert.equal('TITLE', j.bookmarks[0].BookmarkTitle);
    });

    it('BookmarkLevel', () => {
        assert.equal('1', j.bookmarks[0].BookmarkLevel);
    });

    it('BookmarkPageNumber', () => {
        assert.equal('2', j.bookmarks[0].BookmarkPageNumber);
    });
});

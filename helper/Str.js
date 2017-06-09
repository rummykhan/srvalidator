export default new class {

    studlySpaced(string) {
        return (`${string}`).replace(/_/g, ' ');
    }

    reverseStudly(string) {
        return this.toLower((`${string}`).replace(/ /g, '_'));
    }

    ucwords(string) {
        return (`${string}`)
            .replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, $1 => $1.toUpperCase());
    }

    normalize(string) {
        return this.ucwords(this.studlySpaced(string));
    }

    toLower(string) {
        return (`${string}`).toLowerCase();
    }

    contains(haystack, needle) {
        return this.toLower(haystack).indexOf(this.toLower(needle)) > -1;
    }

    ucfirst(string) {
        return (string + '').charAt(0).toUpperCase() + (string + '').slice(1);
    }

}();

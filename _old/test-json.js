function testCallback(param1, callback) {
    // Sa te conectezi la o baza de date
    setTimeout(function () {
        callback("1", "2", "3");
    }, 2000);
}

function testReturn (param1) {
    return "This is a test message for return.";
}

console.log(testReturn("asdahdskjahkjd"));

testCallback("asdahsdkjahskd", function (a, b, c) {
    console.log(a);
    console.log(b);
    console.log(c);
});

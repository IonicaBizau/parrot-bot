const Parrot = require("..")

const NAME = "Emma";

let b1 = new Parrot("ro", { name: NAME });
let b2 = new Parrot("ro", { name: NAME });

let e1msg = b1.tellSync("");
while (true) {
    console.log(`Emma 1> ${e1msg}`);
    let e2msg = b2.tellSync(e1msg);
    console.log(`Emma 2> ${e2msg}`);
    e1msg = b1.tellSync(e2msg);

}
console.log(b1.tellSync(""));

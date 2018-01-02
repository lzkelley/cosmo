
/* == Initialize Python Interface == */

const zerorpc = require("zerorpc");
let client = new zerorpc.Client(timeout=1000);
client.connect("tcp://127.0.0.1:4242");

client.invoke("echo", "server ready", (error, res) => {
    if(error || res !== 'server ready') {
      console.error("Failed to connect to python process in `renderer.js`!");
      console.error(error);
    } else {
      console.log("server is ready");
    }
});

// Load DOM objects from document
let redshift = document.querySelector('#redshiftInput');
let scale = document.querySelector('#scaleInput');
let comDist = document.querySelector('#comDistInput');
let lumDist = document.querySelector('#lumDistInput');
let lbkTime = document.querySelector('#lbkTimeInput');
let ageTime = document.querySelector('#ageTimeInput');

let dialog = document.querySelector('#dialog');


function valueInput(e) {
    console.log("valueInput");
    // If `Enter` is pressed
    if (e.keyCode == 13) {
        // Get the element calling the action (this should be an `input`)
        let srcElement = e.srcElement;

        // Load quantities from element
        let srcName = srcElement.name;
        let srcId = srcElement.id;
        let value = srcElement.value;
        console.log(srcName, srcId, value);
        console.log("client = ", client);

        let retval = calcAndUpdate(value, srcName);
        updateCrossHairs(retval);
        return false;
    }
}

function calcAndUpdate(value, src="z") {
    var retval;
    let args = [src, value];
    console.log("renderer.calcAndUpdate: invoking with args = ", args);
    client.invoke("calc", args, (error, res) => {
        retval = res['dict'];
        let message = res['msg'];
        let msg = 'Python: ' + message;
        console.log("srcName = ", src);
        if (error) {
            console.log("Error!");
            console.error(error);
        } else {
            updateValues(retval, msg);
            updateCrossHairs(retval);
        }
    });
}

function updateValues(retval, msg) {
    console.log("renderer.updateValues()");
    redshift.value = retval['z'];
    scale.value = retval['a'];
    comDist.value = retval['dc'];
    lumDist.value = retval['dl'];
    lbkTime.value = retval['tl'];
    ageTime.value = retval['ta'];
    dialog.textContent = msg;
}

// Bind the function to DOM input forms
document.getElementById('redshiftForm').onkeypress = valueInput;
document.getElementById('scaleForm').onkeypress = valueInput;
document.getElementById('comDistForm').onkeypress = valueInput;
document.getElementById('lumDistForm').onkeypress = valueInput;
document.getElementById('lbkTimeForm').onkeypress = valueInput;
document.getElementById('ageTimeForm').onkeypress = valueInput;


/* == Initialize Python Interface == */

const zerorpc = require("zerorpc")
let client = new zerorpc.Client(timeout=1000)

client.connect("tcp://127.0.0.1:4242")

client.invoke("echo", "server ready", (error, res) => {
  if(error || res !== 'server ready') {
    console.error(error)
  } else {
    console.log("server is ready")
  }
})

// Load DOM objects from document
let redshift = document.querySelector('#redshiftInput')
let lumDist = document.querySelector('#lumDistInput')
let dialog = document.querySelector('#dialog')

function valueInput(e) {
    console.log("valueInput")
    // If `Enter` is pressed
    if (e.keyCode == 13) {
        // Get the element calling the action (this should be an `input`)
        var srcElement = e.srcElement;
        // console.log(srcElement);

        // Load quantities from element
        var srcName = srcElement.name;
        var srcId = srcElement.id;
        var value = srcElement.value;
        console.log(srcName, srcId, value);
        console.log("client = ", client);

        let args = [srcName, value];
        console.log("renderer.valueInput: invoking with args = ", args)
        client.invoke("calc", args, (error, res) => {
            let retval = res[0];
            let message = res[1];
            let msg = 'Python: ' + message
            console.log("srcName = ", srcName);
            console.log("res:", res);
            if (error) {
                console.log("Error!")
                console.error(error)
            } else {
                // result.textContent = res
                if (srcName === 'z') {
                    // console.log('Changing lumDist', lumDist)
                    lumDist.value = retval;
                    dialog.textContent = msg;
                } else if (srcName === 'dl') {
                    // console.log('Changing redshift', redshift)
                    redshift.value = retval;
                    dialog.textContent = msg;
                }
            }
        })

        return false;
    }
}

// Bind the function to DOM input forms
document.getElementById('redshiftForm').onkeypress = valueInput;
document.getElementById('lumDistForm').onkeypress = valueInput;

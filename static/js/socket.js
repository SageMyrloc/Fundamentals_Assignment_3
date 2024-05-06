$(document).ready(function () {
  // Define rate limiting parameters
  var rateLimitInterval = 1000; // Time interval in milliseconds
  var lastEmitTime = 0;

  namespace = "/test";
  var socket = io(namespace);

  socket.on("connect", function () {
    socket.emit("my_event", { data: "connected to the SocketServer..." });
  });

  socket.on("my_response", function (msg, cb) {
    $("#log").append(
      "<br>" +
        $("<div/>")
          .text("logs #" + msg.count + ": " + msg.data)
          .html()
    );
    if (cb) cb();
  });

  // Function to emit data with rate limiting
  function emitWithRateLimit(event, data) {
    var now = Date.now();
    if (now - lastEmitTime >= rateLimitInterval) {
      socket.emit(event, { data: data });
      lastEmitTime = now;
    } else {
      alert("Rate limit exceeded. Ignoring emit request.");
    }
  }

  // Handle form submission with rate-limited emit
  $("form#emit").submit(function (event) {
    var emitData = $("#emit_data").val();
    emitWithRateLimit("my_event", emitData);
    return false;
  });

  // Handle form submission to broadcast with rate limiting
  $("form#broadcast").submit(function (event) {
    var broadcastData = $("#broadcast_data").val();
    emitWithRateLimit("my_broadcast_event" broadcastData);
    return false;
  });

  $("form#disconnect").submit(function (event) {
    socket.emit("disconnect_request");
    return false;
  });
});

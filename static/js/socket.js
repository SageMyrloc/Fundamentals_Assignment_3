// Connect to WebSocket server
const socket = io('https://mbenson-assignment3');

// Handle form submission for emitting messages
$('#emit').submit(function(e) {
    e.preventDefault();
    const message = $('#emit_data').val();
    socket.emit('emit_message', message);
    $('#emit_data').val(''); // Clear input field
});

// Handle form submission for broadcasting messages
$('#broadcast').submit(function(e) {
    e.preventDefault();
    const message = $('#broadcast_data').val();
    socket.emit('broadcast_message', message);
    $('#broadcast_data').val(''); // Clear input field
});

// Handle form submission for disconnecting from server
$('#disconnect').submit(function(e) {
    e.preventDefault();
    socket.disconnect();
});

// Handle incoming messages from the server
socket.on('message', function(data) {
    $('#log').append($('<p>').text('Received: ' + data));
});

// Handle disconnect event from the server
socket.on('disconnect', function() {
    $('#log').append($('<p>').text('Disconnected from server'));
});

// Connect to WebSocket server
const socket = io();

// Handle form submission for emitting messages
$('#emit').submit(function(e) {
    e.preventDefault();
    const message = $('#emit_data').val();
    socket.emit('my_event', { data: message });
    $('#emit_data').val(''); // Clear input field
});

// Handle form submission for broadcasting messages
$('#broadcast').submit(function(e) {
    e.preventDefault();
    const message = $('#broadcast_data').val();
    socket.emit('my_broadcast_event', { data: message });
    $('#broadcast_data').val(''); // Clear input field
});

// Handle form submission for disconnecting from server
$('#disconnect').submit(function(e) {
    e.preventDefault();
    socket.emit('disconnect_request');
});

// Handle incoming messages from the server
socket.on('my_response', function(data) {
    $('#log').append($('<p>').text('Received: ' + data.data));
});

// Handle disconnect event from the server
socket.on('disconnect', function() {
    $('#log').append($('<p>').text('Disconnected from server'));
});

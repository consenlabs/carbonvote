contract Vote {
    event LogVote(address addr);

    function() {
        LogVote(msg.sender);

        if (msg.value > 0) {
            msg.sender.send(msg.value);
        }
    }
}

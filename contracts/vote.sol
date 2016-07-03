contract Vote {
    address creator;

    function Vote() {
        creator = msg.sender;
    }

    function kill() {
        if (msg.sender == creator) {
            suicide(creator);
        }
    }
}

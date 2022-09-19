export/*bundle*/ function routes(app) {
    app.get('/', (req, res) => {
        res.send('Express page with BeyondJS')
    });
}
db.createUser({
    user: 'root',
    pwd: 'test',
    roles: [{
        role: 'readWrite',
        db: 'test',
    }],
});

export /*bundle*/
class Provider {
    users = new Map([
        [1, {id: 1, name: 'User', lastname: 'Testing 1'}],
        [2, {id: 2, name: 'User', lastname: 'Testing 2'}],
        [3, {id: 3, name: 'User', lastname: 'Testing 3'}],
        [4, {id: 4, name: 'User', lastname: 'Testing 4'}],
        [5, {id: 5, name: 'User', lastname: 'Testing 5'}],
        [6, {id: 6, name: 'User', lastname: 'Testing 6'}],
        [7, {id: 7, name: 'User', lastname: 'Testing 7'}],
        [8, {id: 8, name: 'User', lastname: 'Testing 8'}],
        [9, {id: 9, name: 'User', lastname: 'Testing 9'}],
        [10, {id: 10, name: 'User', lastname: 'Testing 10'}],
        [11, {id: 11, name: 'User', lastname: 'Testing 11'}]
    ]);

    get(id) {
        return !this.users.has(id) ? 'User not exist' : this.users.get(id);
    }

    list() {
        const entries = [];
        this.users.forEach(user => entries.push(user));
        return entries;
    }
}
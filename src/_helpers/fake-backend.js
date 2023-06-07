export function configureFakeBackend() {
  let users = [
    {
      id: 1,
      username: "test",
      password: "test",
      firstName: "Test1",
      lastName: "User1"
    },
    {
      id: 2,
      username: "test2",
      password: "test2",
      firstName: "Test2",
      lastName: "Use2"
    },
    {
      id: 3,
      username: "test3",
      password: "test3",
      firstName: "Test3",
      lastName: "User3"
    },
    {
      id: 4,
      username: "test4",
      password: "test4",
      firstName: "Test4",
      lastName: "User4"
    }
  ];
  let realFetch = window.fetch;
  window.fetch = function(url, opts) {
    return new Promise((resolve, reject) => {
      // wrap in timeout to simulate server api call
      setTimeout(() => {
        // authenticate
        if (url.endsWith("/users/authenticate") && opts.method === "POST") {
          // get parameters from post request
          let params = JSON.parse(opts.body);

          // find if any user matches login credentials
          let filteredUsers = users.filter(user => {
            return (
              user.username === params.username &&
              user.password === params.password
            );
          });

          if (filteredUsers.length) {
            // if login details are valid return user details
            let user = filteredUsers[0];
            let responseJson = {
              id: user.id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName
            };
            resolve({
              ok: true,
              text: () => Promise.resolve(JSON.stringify(responseJson))
            });
          } else {
            // else return error
            reject("Username or password is incorrect");
          }

          return;
        }

        // get users
        if (url.endsWith("/users") && opts.method === "GET") {
          // check for fake auth token in header and return users if valid, this security
          // is implemented server side in a real application
          if (
            opts.headers &&
            opts.headers.Authorization === `Basic ${window.btoa("test:test")}`
          ) {
            resolve({
              ok: true,
              text: () => Promise.resolve(JSON.stringify(users))
            });
          } else {
            // return 401 not authorised if token is null or invalid
            resolve({ status: 401, text: () => Promise.resolve() });
          }

          return;
        }

        // pass through any requests not handled above
        realFetch(url, opts).then(response => resolve(response));
      }, 2000);
    });
  };
}

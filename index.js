'use strict';
import Hapi from '@hapi/hapi';

const initHost = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {

            return `
              <!doctype html>
              <title>Host Frame</title>
              <body>
              <script>
                const onSuccess = () => {
                  const p = document.createElement('p');
                  p.textContent = 'We have a cookie. We can retrieve data';
                  document.body.appendChild(p);
                };
                const onError = () => {
                  const p = document.createElement('p');
                  p.textContent = 'We do not have a cookie. Data can not be retrieved.';
                  document.body.appendChild(p);
                };
                fetch('http://localhost:3000/sample-api', {credentials: 'include'})
                .then(res => {
                  if (res.status === 401) {
                    throw new Error('Unauthorized');
                  }
                })
                .then(onSuccess, onError);
              </script>
            `;
        }
    });

    server.route({
      method: 'GET',
      path: '/sample-api',
      handler: (request, h) => {
        if (request.state?.tmp === undefined) {
          return h.response({
            'error': 'Cookie must be set to retrieve data',
          }).code(401);
        }

        return h.response({
          'data': 'Cookie is set, can get data'
        }).code(200);
      },
    });

    server.route({
      method: 'GET',
      path: '/session-support',
      handler: (request, h) => {

        return `
          <!doctype html>
          <title>Session Support</title>
          <script>
            document.cookie = 'tmp=1; SameSite=None; max-age=300; secure';
          </script>
          <a>Return to Application</a>
        `;
      },
    })

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

const initClient = async () => {
  const server = Hapi.server({
    port: 4000,
    host: 'localhost'
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
        return `
          <!doctype html>
          <title>Client Sample</title>
          <body>
          <iframe src="http://localhost:3000" width="500px" height="750px"></iframe>
        `;
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

initHost();
initClient();

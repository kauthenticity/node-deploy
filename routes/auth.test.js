const request = require('supertest');
const {sequelize} = require('../models');
const app = require('../app');

beforeAll(async()=>{ // 테스트 하기 전에 db에 테이블 생성
  await sequelize.sync();
});

describe('POST /join', ()=>{ // /join의 post 요청에 대한 test
  test('로그인 안 했으면 가입', (done)=>{ // 로그인 안했을 때 /join의 post 요청에 대한 test
    request(app)
    .post('/auth/join')
    .send({ // email, nickname, password를 데이터로 보내서 회원가입 시킴
      email : 'zeroch0@gmail.com',
      nick : 'zerocho',
      password : 'nodejsbook'
    })
    .expect('Location', '/')
    .expect(302, done);
  });
});

describe('POST /join', ()=>{ // /join의 post 요청에 대한 test
  const agent = request.agent(app); // 한 세션에 대해 지속되는 요청을 할때는 request.agent()사용

  beforeEach((done)=>{ // test를 수행하기 전에
    agent.post('/auth/login').send({
      email : 'zeroch0@gmail.com',
      password : 'nodejsbook',
    }) // 로그인 시킴
    .end(done); // beforeEach에서는 끝났다고 .end(done)을 줘야 함.
  });

  test('이미 로그인했으면 redirect /', (done)=>{ // /로그인한 후 회원가입 시도
    const message = encodeURIComponent('로그인한 상태입니다');
    agent.post('/auth/join').send({
      email : 'zeroch0@gmail.com',
      nick : 'zerocho',
      password : 'nodejsbook',
    }) // 회원가입요청을 보내면
    .expect('Location', `/?error=${message}`) // 에러메시지와
    .expect(302, done); // 302 응답코드가 와야 함. 테스트가 끝났다는 뜻으로 done을 넘겨 줌
  });
});

describe('POST /login', ()=>{ // /login에 대한 POST 요청 테스트
  test('로그인 수행', done=>{ // request 함수를 사용할때는 테스트가 끝났다는 뜻의 done을 파라미터로 넘겨줌
    request(app) // app 모듈에 request를 보냄
    .post('/auth/login') // /auth/login에 대한 POST 요청을 보냄
    .send({  // 요청의 body
      email : 'zeroch0@gmail.com',
      password : 'nodejsbook',
     })
     .expect('Location', '/') // Location헤더가 '/'인지
     .expect(302, done); // 상태코드가 302d인지 테스트. done을 인수로 넣어서 테스트가 끝났음을 알림.
  });
});

describe('POST /login', ()=>{
  test('가입되지 않은 회원', async(done)=>{
    const message = encodeURIComponent('가입되지 않은 회원입니다.');
    const res = await request(app)
    .post('/auth/login')
    .send({
      email : 'zeroch1@gmail.com',
      password : 'nodejsbook'
    }).expect('Location', `/?loginError=${message}`)
    .expect(302, done);
    
    //expect(res.header.location).toBe(`/?loginError=${message}`);
    //expect(res.statusCode).toBe(302);
  });

  test('로그인 수행', async ()=>{
    const message = encodeURIComponent('비밀번호가 일치하지 않습니다.');
    const value = await request(app)
    .post('/auth/login')
    .send({
      email : 'zeroch0@gmail.com',
      password : 'wrong',
    });

    expect(value.header.location).toBe(`/?loginError=${message}`);
    expect(value.statusCode).toBe(302);

  });
});

describe('GET /logout', ()=>{
  test('로그인 되어 있지 않으면 403', done=>{
    request(app)
    .get('/auth/logout')
    .expect(403, done);
  });

  const agent = request.agent(app);

  beforeEach(done=>{
    agent.post('/auth/login')
    .send({
      email : 'zeroch0@gmail.com',
      password : 'nodejsbook'
    })
    .end(done);
  });

  test('로그아웃 수행', done=>{
    agent.get('/auth/logout')
    .expect('Location', '/')
    .expect(302, done);
  });
});


afterAll(async()=>{
  await sequelize.sync({force : true});
})
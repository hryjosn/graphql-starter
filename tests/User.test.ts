import { createTestContext } from './__helpers'
const ctx = createTestContext()
it('ensures that a user can sign up', async () => {
  const signUpResult = await ctx.client.request(`            
    mutation {
      signup(name: "Quentin", email: "q@gmail.com",password:"tesztPwd") {     
        user {
            name
        }
        token
      }
    }
  `)
  expect(signUpResult.signup.user).toMatchInlineSnapshot(`
Object {
  "name": "Quentin",
}
`)
  expect(signUpResult.token).not.toBeNull()

  const persistedData = await ctx.db.user.findMany({
    select: { email: true, name: true, id: true },
  })
  expect(persistedData).toMatchInlineSnapshot(`
Array [
  Object {
    "email": "q@gmail.com",
    "id": 1,
    "name": "Quentin",
  },
]
`)
})

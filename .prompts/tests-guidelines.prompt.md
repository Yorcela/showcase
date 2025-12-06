# TALLAE TESTING GUIDELINES (for Codex or AI test generation)

Always generate Jest unit tests that follow these conventions:

1. Each test must use the format:
   it('should <describe expected behavior>', async () => { ... });

2. Each test must contain exactly these 3 sections as comments (in caps):
   // GIVEN
   // WHEN
   // THEN
   and do not contain /// <reference types="jest" /> at the begining of the file

3. Expected results must always be stored in a variable named:
   - expected
   - or expected<Something> if multiple expectations.

4. Test files must end with `.spec.ts`.
   For error and success type (.error.ts and .success.ts) do only one file for the whole category

5. When testing a function or service:
   - Instantiate dependencies explicitly.
   - Avoid testing internal implementation details.
   - Use readable Jest assertions (`toBe`, `toEqual`, `toMatchObject`, `toThrow`, etc.).
   - Use one `it()` per behavior.

Example for a service:

```ts
describe("PasswordService", () => {
  it("should hash a password correctly", async () => {
    // Given
    const service = new PasswordService();
    const plain = "mySecret";

    // When
    const result = await service.hash(plain);

    // Then
    const expected = true;
    expect(result).toBeDefined();
    expect(service.verify(plain, result)).toBe(expected);
  });
});
```

6. When testing HTTP endpoints (controllers):

- Verify the HTTP status code.
- Verify the JSON payload shape and keys.
- Do an additionnal file <controllername>`.e2e.spec.ts` for controllers (files with .controller.ts in their name) where you'll test the behavior of the http call but mock the results just to be sure the server returns valid results ({status:number, success: true, data: <payload sned by controller>} for a success and {status:number, success: false, error: { code: string, message: string, context: any | null } for a failure})
- endpoints use GlobalFilters (example AppErrorFilter), GlobalInterceptors (example : AppResponseInterceptor)
  and GlobalPipes (example ValidationPipe, EmailPipe) that you'll find in src/main.ts. Use this information to add testing cases when necessary.

Example for an endpoint:

```ts
describe("POST /auth/register-email", () => {
  it(`should return ${HttpStatus.CREATED} and user payload`, async () => {
    // Given
    const dto = { email: "user@example.com", userRole: "USER" };

    // When
    const response = await request(app.getHttpServer()).post("/auth/register-email").send(dto);

    // Then
    const expectedStatus = HttpStatus.CREATED;
    const expectedPayload = {
      success: true,
      data: {
        user: expect.objectContaining({
          email: dto.email,
          status: UserStatus.PENDING_VERIFICATION,
        }),
      },
    };

    expect(response.status).toBe(expectedStatus);
    expect(response.body).toMatchObject(expectedPayload);
  });
});
```

7. When testing business errors:

- Name the test “should throw when”
- Use await expect(...).rejects.toThrow(ErrorClass)

```ts
it("should throw AuthRegisterEmailExistsError when email already exists", async () => {
  // Given
  const dto = { email: "taken@example.com" };

  // When / Then
  await expect(service.registerEmail(dto)).rejects.toThrow(AuthRegisterEmailExistsError);
});
```

8. Do not include console logs, and ensure readability > cleverness.

9. Use enums, const etc. when necessary more than using absolute values. Examples :

- use HttpStatus.CREATED and not 201
- use AuthErrorCode.REGISTRATION_EMAIL_EXISTS and not "AUTH_REG_001"
- use AuthErrorMessageMap[AuthErrorCode.REGISTRATION_EMAIL_EXISTS] and not "An account with this email address already exists"
  These are examples and the list is not exhaustive.

10. Minimum code coverage to respect at all cost :

- statements: 85%
- branches: 80%
- functions: 85%
- lines: 85%

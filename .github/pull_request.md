
## Describe your changes

## Issue ticket code (and/or) and link

### **General**

* [ ] Assigned myself to the PR
* [ ] Assigned the appropriate labels to the PR
* [ ] Assigned the appropriate reviewers to the PR
* [ ] Updated the documentation
* [ ] Performed a self-review of my code
* [ ] Types for input and output parameters
* [ ] Don't have "any" on my code
* [ ] Used the try/catch pattern for error handling
* [ ] Don't have magic numbers
* [ ] Compare only with constants not with strings
* [ ] No ternary operator inside the ternary operator
* [ ] Don't have commented code
* [ ] No links in the code, env links should be in env file (for example: server url), constant links (for example default avatar URL) should be in constant file
* [ ] Used camelCase for variables and functions
* [ ] Date and time formats are on the constants
* [ ] Functions are public only if it's used outside the class
* [ ] No hardcoded values
* [ ] Covered by tests
* [ ] Check your commit messages meet the [conventional commit format](https://www.conventionalcommits.org/en/v1.0.0/)

### Frontend

* [ ] Components and business logic are separated
* [ ] Colors, Font Size, and Font Name is on the theme or in the constants
* [ ] No text in the components, use i18n approach
* [ ] No inline styles
* [ ] Imports are absolute
* [ ] Attach a screenshot if PR has visual changes

### Backend

* [ ] Swagger @ApiOperation + @ApiResponse (2xx, 4xx, 5xx) on every endpoint
* [ ] ConfigService used instead of process.env directly
* [ ] UUID primary keys on new entities
* [ ] @Index added to columns used in WHERE / JOIN clauses
* [ ] Database mutations across multiple tables wrapped in a transaction
* [ ] DTOs have class-validator decorators; forbidNonWhitelisted: true respected
* [ ] NestJS ESLint rules respected (.eslintrc.js)
* [ ] REST API naming convention followed (GET /resources, POST /resources, etc.)

### Screenshots / Recordings
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GoCook is a food marketplace platform with menu management, chef/seller workspaces, and customer ordering. Monorepo structure with Spring Boot backend and React frontend.

**Tech Stack:**
- Backend: Spring Boot 3.5.6, Java 21, PostgreSQL, Redis, RabbitMQ, Liquibase
- Frontend: React 19, Vite, TypeScript 6, React Router, Bootstrap
- Auth: JWT with cookie-based access/refresh tokens
- Storage: Cloudinary for images

## Essential Commands

### Backend (Spring Boot)
```bash
# Start services (Postgres, Redis, RabbitMQ)
docker compose up -d

# Run backend
./mvnw spring-boot:run

# Build
./mvnw clean install

# Run tests
./mvnw test

# Format code (Google Java Format)
./mvnw fmt:format

# Run single test
./mvnw test -Dtest=ClassName#methodName
```

### Frontend (React + Vite)
```bash
cd frontend

# Development server (http://localhost:5173)
npm run dev

# Type checking
npm run typecheck

# Build for production
npm run build

# Preview production build
npm run preview
```

### Database Migrations
```bash
# Liquibase is configured via liquibase-maven-plugin
# Migrations: src/main/resources/db/changelog/
# Config: src/main/resources/liquibase.properties

# Generate changelog (requires liquibase.properties setup)
./mvnw liquibase:generateChangeLog

# Update database
./mvnw liquibase:update
```

## Architecture

### Backend Layer Pattern

**Controller → Facade → Service → Repository**

- **Controller** (`/controller`): REST endpoints, request/response handling
- **Facade** (`/facade`, `/facade/impl`): Orchestration layer between controllers and services
- **Service** (`/service`, `/service/impl`): Business logic
- **Repository** (`/repository`): JPA data access with specifications for dynamic queries

**Key packages:**
- `/dto`: Data transfer objects
- `/entity`: JPA entities (domain models)
- `/request`: Request body models
- `/response`: Response models
- `/config`: Spring configuration (Security, CORS, Redis, RabbitMQ, Cloudinary, Swagger)
- `/interceptor`: Custom authentication filters
- `/exception`: Exception handling
- `/util`: Shared utilities

### Authentication Flow

JWT-based with cookie storage:
1. Login: `POST /api/v2/users/login` → returns cookies (`access-token`, `refresh-token`)
2. Protected endpoints require valid `access-token` cookie
3. Refresh: `POST /api/v2/users/refresh-token` → issues new access token
4. Logout: `POST /api/v2/users/logout` → clears cookies

**Security Config** (`SecurityConfig.java`):
- Whitelist in `WHITE_LISTS` array (public endpoints)
- Custom interceptors: `AuthTokenProviderInterceptor`, `UserDetailsAuthenticationProviderInterceptor`
- All other endpoints require authentication

### Frontend Architecture

**State Management:** Context API (no Redux)
- Contexts in `/contexts`: ProfileContext, MenuContext, CategoryContext, DishContext, etc.
- AuthStore: External store for auth state (`/stores/authStore`)

**Routing:** React Router v7
- Main routes: Home, Menu Catalog, Menu Detail, Custom Menu, Profile
- Seller routes: `/seller/*` (Dashboard, Products, Orders, Revenue, Schedule, Menu Management)
- Protected routes use `ProtectedRoute` component with auth checks

**API Configuration:** `/config/ApiConfig.tsx`
- Centralized endpoint definitions
- Versioned APIs (V1, V2, V3)
- Service namespace (USER, CURRICULUM)

**Key directories:**
- `/pages`: Page components (Home, Login, Signup, Profile, seller/*)
- `/components`: Reusable UI components
- `/layouts`: Layout wrappers (MainLayout, SellerDemoLayout)
- `/hooks`: Custom React hooks
- `/clients`: API client utilities
- `/validations`: Form validation logic

### API Versioning

Backend uses versioned endpoints:
- `/api/v1/*` - Original API
- `/api/v2/*` - Newer auth endpoints (login, refresh, logout)

When adding new endpoints, follow existing patterns:
- V1 for new features unless breaking changes required
- Update `SecurityConfig.WHITE_LISTS` for public endpoints
- Update frontend `ApiConfig.tsx` endpoint definitions

## Development Workflow

### Adding a New Feature

**Backend:**
1. Create/update entity in `/entity`
2. Add repository in `/repository` (extend JpaRepository)
3. Create service interface + implementation in `/service` and `/service/impl`
4. Create facade interface + implementation in `/facade` and `/facade/impl`
5. Add controller in `/controller` with request/response models
6. Update `SecurityConfig.WHITE_LISTS` if endpoint should be public

**Frontend:**
1. Add endpoint to `ApiConfig.tsx`
2. Create/update context in `/contexts` if managing state
3. Create/update page in `/pages`
4. Add route in `Router.tsx`
5. Update components in `/components`

### Database Changes

Liquibase manages schema:
- Changelog: `src/main/resources/db/changelog/`
- Changes directory: `src/main/resources/db/changes/`
- Always create new changelog files, never modify applied ones
- Format: `YYYYMMDD_descriptive_name.sql` or `.xml`

### Running Locally

1. Start dependencies: `docker compose up -d`
2. Backend: `./mvnw spring-boot:run` (port 8080)
3. Frontend: `cd frontend && npm run dev` (port 5173)
4. API docs: http://localhost:8080/swagger-ui.html

## Code Conventions

### Backend
- Use Lombok annotations (`@Data`, `@RequiredArgsConstructor`, etc.)
- Service methods throw exceptions; facades/controllers handle them
- Repository specifications for complex queries
- Request/Response models separate from entities
- Use `@EnableMethodSecurity` with role checks where needed

### Frontend
- Functional components with hooks
- TypeScript strict mode
- Context API for cross-component state
- Centralized API endpoint definitions
- Protected routes pattern for auth-required pages
- Use `as const` for constant objects (type safety)

## Common Patterns

### Backend: Creating an Endpoint
```java
// Controller
@RestController
@RequestMapping("/api/v1/resource")
public class ResourceController {
    private final ResourceFacade facade;
    
    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getAll() {
        return ResponseEntity.ok(facade.getAll());
    }
}

// Facade delegates to service, handles DTO conversion
// Service contains business logic
// Repository handles data access
```

### Frontend: API Call with Context
```typescript
// In context
const fetchData = async () => {
    const response = await axios.get(ENDPOINTS.RESOURCE.GET.V1);
    setState(response.data);
};

// In component
const { data, fetchData } = useResourceContext();
```

## Notes

- Package name is `com.james.LMS` (legacy from original project structure)
- Main application: `GoCookServiceApplication.java`
- Environment configs: `application.yml`, `application-dev.yml`, `application-prod.yaml`
- Frontend dev server proxies API requests (check `vite.config.ts` if needed)
- Seller workspace is separate UI section with its own layout and routes

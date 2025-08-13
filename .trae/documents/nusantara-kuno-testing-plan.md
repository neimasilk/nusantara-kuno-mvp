# Nusantara Kuno - Testing & Quality Assurance Plan

## 1. Testing Philosophy

**"Test Early, Test Often, Keep It Simple"**

- ✅ Focus on critical user journeys
- ✅ Automate repetitive tests
- ✅ Manual testing for UX validation
- ✅ Real user feedback over perfect coverage
- ✅ Fast feedback loops

## 2. Testing Pyramid

```
    /\     E2E Tests (10%)
   /  \    - Critical user flows
  /____\   - Cross-browser testing
 
  /______\  Integration Tests (30%)
 /        \ - API endpoints
/__________\- Component interactions

/____________\ Unit Tests (60%)
              - Pure functions
              - Custom hooks
              - Utilities
```

## 3. Pre-Launch Testing Checklist

### 3.1 Week 1: Core Functionality

**✅ Recipe Display**
- [ ] Recipe cards show correctly on mobile/desktop
- [ ] Recipe detail page loads all content
- [ ] Images load and display properly
- [ ] Ingredients and steps are readable
- [ ] Cultural story section displays

**✅ Search & Filter**
- [ ] Search returns relevant results
- [ ] Regional filter works (Jawa, Sumatra, etc.)
- [ ] Difficulty filter functions
- [ ] "No results" state displays properly
- [ ] Search handles special characters

**✅ User Authentication**
- [ ] Registration with email works
- [ ] Login/logout functions
- [ ] Password reset works
- [ ] Session persists on refresh
- [ ] Protected routes redirect to login

**✅ Bookmark System**
- [ ] Add bookmark works
- [ ] Remove bookmark works
- [ ] Bookmarks persist after logout/login
- [ ] Bookmark count updates in real-time
- [ ] Profile page shows all bookmarks

### 3.2 Week 2: User Experience

**✅ Performance**
- [ ] Homepage loads in <3 seconds
- [ ] Recipe page loads in <2 seconds
- [ ] Images load progressively
- [ ] No layout shift during loading
- [ ] Smooth scrolling and transitions

**✅ Responsive Design**
- [ ] Mobile (320px-768px) works perfectly
- [ ] Tablet (768px-1024px) displays correctly
- [ ] Desktop (1024px+) utilizes space well
- [ ] Touch targets are >44px on mobile
- [ ] Text is readable on all screen sizes

**✅ Accessibility**
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Color contrast meets WCAG standards
- [ ] Alt text for all images
- [ ] Focus indicators visible

**✅ Error Handling**
- [ ] Network errors show user-friendly messages
- [ ] 404 page exists and is helpful
- [ ] Form validation provides clear feedback
- [ ] Loading states prevent user confusion
- [ ] Retry mechanisms work

### 3.3 Week 3: Business Logic

**✅ Premium Features**
- [ ] Free users see limited recipes
- [ ] Premium paywall works correctly
- [ ] Payment flow completes successfully
- [ ] Premium content unlocks after payment
- [ ] Subscription status updates in real-time

**✅ Content Quality**
- [ ] All recipe ingredients are complete
- [ ] Cooking steps are clear and numbered
- [ ] Cultural stories are factually accurate
- [ ] Images match the recipes
- [ ] No typos or grammatical errors

**✅ Data Integrity**
- [ ] User data saves correctly
- [ ] Bookmarks don't duplicate
- [ ] Progress tracking works
- [ ] Database constraints prevent bad data
- [ ] Backup and restore functions

## 4. Automated Testing Setup

### 4.1 Unit Tests (Jest + React Testing Library)

```typescript
// tests/components/RecipeCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeCard } from '../components/RecipeCard';

test('displays recipe information correctly', () => {
  const mockRecipe = {
    id: '1',
    title: 'Gudeg Yogya',
    region: 'jawa',
    difficulty: 'sulit',
    cooking_time: 180,
    image_url: 'test.jpg'
  };
  
  render(<RecipeCard recipe={mockRecipe} />);
  
  expect(screen.getByText('Gudeg Yogya')).toBeInTheDocument();
  expect(screen.getByText('Jawa')).toBeInTheDocument();
  expect(screen.getByText('3 jam')).toBeInTheDocument();
});

test('calls onBookmark when bookmark button clicked', () => {
  const mockOnBookmark = jest.fn();
  const mockRecipe = { /* ... */ };
  
  render(<RecipeCard recipe={mockRecipe} onBookmark={mockOnBookmark} />);
  
  fireEvent.click(screen.getByRole('button', { name: /bookmark/i }));
  
  expect(mockOnBookmark).toHaveBeenCalledWith('1');
});
```

### 4.2 Integration Tests (React Testing Library)

```typescript
// tests/integration/RecipeFlow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';

test('user can search and bookmark recipe', async () => {
  const user = userEvent.setup();
  render(<App />);
  
  // Search for recipe
  await user.type(screen.getByPlaceholderText(/search recipes/i), 'gudeg');
  await user.click(screen.getByRole('button', { name: /search/i }));
  
  // Wait for results
  await waitFor(() => {
    expect(screen.getByText('Gudeg Yogya')).toBeInTheDocument();
  });
  
  // Click on recipe
  await user.click(screen.getByText('Gudeg Yogya'));
  
  // Bookmark recipe
  await user.click(screen.getByRole('button', { name: /bookmark/i }));
  
  // Verify bookmark was added
  expect(screen.getByText(/bookmarked/i)).toBeInTheDocument();
});
```

### 4.3 E2E Tests (Playwright)

```typescript
// tests/e2e/user-journey.spec.ts
import { test, expect } from '@playwright/test';

test('complete user journey: browse → bookmark → profile', async ({ page }) => {
  // Start at homepage
  await page.goto('/');
  
  // Browse recipes
  await page.click('[data-testid="recipe-card-gudeg"]');
  await expect(page.locator('h1')).toContainText('Gudeg Yogya');
  
  // Login first
  await page.click('[data-testid="login-button"]');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="submit-login"]');
  
  // Bookmark recipe
  await page.click('[data-testid="bookmark-button"]');
  await expect(page.locator('[data-testid="bookmark-status"]')).toContainText('Bookmarked');
  
  // Check profile
  await page.click('[data-testid="profile-link"]');
  await expect(page.locator('[data-testid="bookmarked-recipe"]')).toBeVisible();
});

test('premium upgrade flow', async ({ page }) => {
  await page.goto('/recipe/premium-recipe-id');
  
  // Should see paywall
  await expect(page.locator('[data-testid="premium-paywall"]')).toBeVisible();
  
  // Click upgrade
  await page.click('[data-testid="upgrade-button"]');
  
  // Should redirect to payment
  await expect(page.url()).toContain('/upgrade');
  
  // Fill payment form (test mode)
  await page.fill('[data-testid="card-number"]', '4111111111111111');
  await page.fill('[data-testid="expiry"]', '12/25');
  await page.fill('[data-testid="cvv"]', '123');
  
  // Complete payment
  await page.click('[data-testid="pay-button"]');
  
  // Should redirect back to recipe
  await expect(page.url()).toContain('/recipe/');
  await expect(page.locator('[data-testid="premium-content"]')).toBeVisible();
});
```

## 5. Manual Testing Scenarios

### 5.1 User Acceptance Testing

**Scenario 1: New User Discovery**
- User lands on homepage
- Browses featured recipes
- Uses search to find specific cuisine
- Reads recipe and cultural story
- Decides to bookmark (requires signup)
- Completes registration
- Successfully bookmarks recipe

**Scenario 2: Returning User**
- User logs in
- Checks bookmarked recipes
- Discovers new recipe
- Reads and rates recipe
- Shares recipe on social media

**Scenario 3: Premium Conversion**
- Free user hits premium recipe limit
- Sees upgrade prompt
- Reviews premium benefits
- Completes payment
- Accesses premium content
- Explores additional features

### 5.2 Device Testing Matrix

| Device | Browser | Screen Size | Priority |
|--------|---------|-------------|----------|
| iPhone 12 | Safari | 390x844 | High |
| Samsung Galaxy | Chrome | 360x640 | High |
| iPad | Safari | 768x1024 | Medium |
| MacBook | Chrome | 1440x900 | High |
| Windows PC | Edge | 1920x1080 | Medium |

### 5.3 Performance Testing

**Load Testing**:
- 100 concurrent users browsing recipes
- 50 users searching simultaneously
- 25 users completing registration
- Database performance under load

**Stress Testing**:
- Image loading with slow 3G
- Database queries with 1000+ recipes
- Payment processing under load
- Error recovery scenarios

## 6. User Testing Plan

### 6.1 Beta Testing Group

**Target: 50 Beta Users**
- 20 Indonesian diaspora (US, Australia, Netherlands)
- 15 Local food enthusiasts (Jakarta, Yogya, Bali)
- 10 Cooking hobbyists (various backgrounds)
- 5 Senior users (50+ years old)

**Testing Period**: 2 weeks before public launch

### 6.2 Testing Tasks

**Week 1: Core Functionality**
1. Find and bookmark 3 recipes from different regions
2. Complete the registration process
3. Use search to find a specific ingredient
4. Rate and provide feedback on 2 recipes
5. Try to access premium content

**Week 2: Real Usage**
1. Use the app naturally for 1 week
2. Try to cook 1 recipe from the app
3. Share a recipe with friends/family
4. Provide feedback on missing features
5. Rate overall experience

### 6.3 Feedback Collection

**Quantitative Metrics**:
- Task completion rate
- Time to complete tasks
- Error frequency
- App usage patterns
- Conversion to premium

**Qualitative Feedback**:
- User satisfaction surveys
- One-on-one interviews
- Feature request collection
- Pain point identification
- Cultural authenticity validation

## 7. Quality Gates

### 7.1 Pre-Launch Criteria

**Must Have (Blocking)**:
- [ ] 95%+ unit test coverage for critical paths
- [ ] All E2E tests passing
- [ ] Performance: <3s homepage load
- [ ] Zero critical security vulnerabilities
- [ ] Payment flow 100% functional
- [ ] Mobile responsive on all target devices
- [ ] Accessibility score >90

**Should Have (Non-blocking)**:
- [ ] 90%+ user task completion rate
- [ ] <5% error rate in user testing
- [ ] 4.0+ average user satisfaction score
- [ ] SEO score >80
- [ ] Cross-browser compatibility confirmed

### 7.2 Post-Launch Monitoring

**Week 1 Metrics**:
- Error rate <1%
- Page load time <3s
- User registration success rate >90%
- Payment success rate >95%
- User retention >60%

**Month 1 Metrics**:
- App crash rate <0.1%
- User satisfaction >4.0/5
- Premium conversion >5%
- Recipe engagement >60%
- Support ticket volume <10/day

## 8. Testing Tools & Setup

### 8.1 Development Environment

```bash
# Install testing dependencies
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @playwright/test \
  jest \
  msw

# Run tests
npm run test:unit        # Jest unit tests
npm run test:integration # Integration tests
npm run test:e2e         # Playwright E2E
npm run test:all         # All tests
```

### 8.2 CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
      
  deploy:
    needs: [unit-tests, e2e-tests]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy to production"
```

### 8.3 Monitoring & Analytics

**Error Tracking**: Sentry
```javascript
// Error boundary for React components
// Automatic error reporting
// Performance monitoring
```

**User Analytics**: Google Analytics 4
```javascript
// User journey tracking
// Conversion funnel analysis
// Recipe engagement metrics
```

**Performance**: Vercel Analytics
```javascript
// Core Web Vitals
// Page load times
// User experience metrics
```

## 9. Testing Schedule

### Pre-Development (Week -2)
- [ ] Set up testing environment
- [ ] Write test plan documentation
- [ ] Recruit beta testing group
- [ ] Prepare testing devices

### Development Phase (Week 1-6)
- [ ] Write unit tests alongside features
- [ ] Daily smoke tests
- [ ] Weekly integration testing
- [ ] Continuous E2E testing

### Pre-Launch (Week 7-8)
- [ ] Complete test suite execution
- [ ] Beta user testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Final quality gate review

### Post-Launch (Week 9+)
- [ ] Daily monitoring
- [ ] Weekly user feedback review
- [ ] Monthly testing retrospective
- [ ] Continuous improvement

---

**Testing Success Criteria**:
✅ Zero critical bugs in production
✅ >95% user task completion rate
✅ <3 second average page load time
✅ >4.0 user satisfaction score
✅ >90% payment success rate

**Remember**: "Perfect is the enemy of good" - Focus on testing what matters most to users.
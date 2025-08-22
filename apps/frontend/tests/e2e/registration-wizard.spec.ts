import { test, expect } from '@playwright/test';

test.describe('Society Registration Wizard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dev login page
    await page.goto('/dev-login');
  });

  test('Full happy path: login → fill wizard → upload docs → simulate payment → confirm submitted', async ({ page }) => {
    // Step 1: Login as Owner
    await test.step('Login as Owner', async () => {
      await page.selectOption('select[name="role"]', 'OWNER');
      await page.click('button[type="submit"]');
      
      // Wait for redirect to registration page
      await expect(page).toHaveURL('/register-society');
    });

    // Step 2: Fill Society Details
    await test.step('Fill Society Details', async () => {
      await page.fill('input[name="societyName"]', 'Test Society');
      await page.fill('input[name="societyAddress"]', '123 Test Street');
      await page.fill('input[name="societyCity"]', 'Test City');
      await page.fill('input[name="societyState"]', 'Test State');
      await page.fill('input[name="societyPincode"]', '123456');
      
      // Click next to proceed to committee details
      await page.click('button:has-text("Next")');
      
      // Verify we're on committee details step
      await expect(page.locator('h2')).toContainText('Committee Details');
    });

    // Step 3: Fill Committee Details
    await test.step('Fill Committee Details', async () => {
      await page.fill('input[name="chairmanName"]', 'John Chairman');
      await page.fill('input[name="chairmanPhone"]', '+1234567890');
      await page.fill('input[name="secretaryName"]', 'Jane Secretary');
      await page.fill('input[name="secretaryPhone"]', '+1234567891');
      await page.fill('input[name="treasurerName"]', 'Bob Treasurer');
      await page.fill('input[name="treasurerPhone"]', '+1234567892');
      
      // Click next to proceed to documents upload
      await page.click('button:has-text("Next")');
      
      // Verify we're on documents upload step
      await expect(page.locator('h2')).toContainText('Documents Upload');
    });

    // Step 4: Upload Documents
    await test.step('Upload Documents', async () => {
      // Create test files
      const panFile = Buffer.from('Test PAN document content');
      const registrationFile = Buffer.from('Test registration certificate content');
      const addressFile = Buffer.from('Test address proof content');

      // Upload PAN document
      await page.setInputFiles('input[type="file"][data-document-type="PAN"]', {
        name: 'pan-document.pdf',
        mimeType: 'application/pdf',
        buffer: panFile,
      });

      // Upload Registration Certificate
      await page.setInputFiles('input[type="file"][data-document-type="REGISTRATION_CERT"]', {
        name: 'registration-cert.pdf',
        mimeType: 'application/pdf',
        buffer: registrationFile,
      });

      // Upload Address Proof
      await page.setInputFiles('input[type="file"][data-document-type="ADDRESS_PROOF"]', {
        name: 'address-proof.pdf',
        mimeType: 'application/pdf',
        buffer: addressFile,
      });

      // Wait for uploads to complete
      await page.waitForTimeout(2000);

      // Verify documents are uploaded
      await expect(page.locator('.document-item')).toHaveCount(3);
      
      // Click next to proceed to payment
      await page.click('button:has-text("Next")');
      
      // Verify we're on payment step
      await expect(page.locator('h2')).toContainText('Payment');
    });

    // Step 5: Payment Processing
    await test.step('Payment Processing', async () => {
      // Verify payment amount is displayed
      await expect(page.locator('.payment-amount')).toBeVisible();
      
      // Click proceed to payment
      await page.click('button:has-text("Proceed to Payment")');
      
      // Wait for payment order creation
      await page.waitForTimeout(2000);
      
      // Verify payment success (this would normally come from webhook)
      // For testing, we'll simulate a successful payment
      await page.evaluate(() => {
        // Simulate webhook success
        localStorage.setItem('paymentStatus', 'COMPLETED');
      });
      
      // Refresh page to see updated status
      await page.reload();
      
      // Verify payment is completed
      await expect(page.locator('.payment-status')).toContainText('Completed');
      
      // Click next to proceed to review
      await page.click('button:has-text("Next")');
      
      // Verify we're on review step
      await expect(page.locator('h2')).toContainText('Review & Submit');
    });

    // Step 6: Review and Submit
    await test.step('Review and Submit', async () => {
      // Verify all information is displayed correctly
      await expect(page.locator('.society-name')).toContainText('Test Society');
      await expect(page.locator('.society-address')).toContainText('123 Test Street');
      await expect(page.locator('.chairman-name')).toContainText('John Chairman');
      await expect(page.locator('.documents-count')).toContainText('3');
      await expect(page.locator('.payment-status')).toContainText('Completed');
      
      // Submit the registration
      await page.click('button:has-text("Submit Registration")');
      
      // Wait for submission
      await page.waitForTimeout(2000);
      
      // Verify success message
      await expect(page.locator('.success-message')).toContainText('Registration submitted successfully');
      await expect(page.locator('.registration-status')).toContainText('UNDER_REVIEW');
    });

    // Step 7: Verify Final State
    await test.step('Verify Final State', async () => {
      // Check that the registration is in the correct state
      await expect(page.locator('.funnel-stage')).toContainText('UNDER_REVIEW');
      
      // Verify all steps are completed
      await expect(page.locator('.step-completed')).toHaveCount(5);
      
      // Verify registration ID is displayed
      await expect(page.locator('.registration-id')).toBeVisible();
    });
  });

  test('Auto-save functionality on each step', async ({ page }) => {
    // Login as Owner
    await page.selectOption('select[name="role"]', 'OWNER');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/register-society');

    // Fill partial society details
    await page.fill('input[name="societyName"]', 'Auto-save Test Society');
    await page.fill('input[name="societyAddress"]', '456 Auto-save Street');
    
    // Wait for auto-save
    await page.waitForTimeout(1000);
    
    // Navigate away and back
    await page.goto('/');
    await page.goto('/register-society');
    
    // Verify data is preserved
    await expect(page.locator('input[name="societyName"]')).toHaveValue('Auto-save Test Society');
    await expect(page.locator('input[name="societyAddress"]')).toHaveValue('456 Auto-save Street');
  });

  test('Error handling and validation', async ({ page }) => {
    // Login as Owner
    await page.selectOption('select[name="role"]', 'OWNER');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/register-society');

    // Try to proceed without filling required fields
    await page.click('button:has-text("Next")');
    
    // Verify validation errors
    await expect(page.locator('.error-message')).toContainText('Society name is required');
    await expect(page.locator('.error-message')).toContainText('Address is required');
    
    // Fill invalid data
    await page.fill('input[name="societyPincode"]', 'invalid');
    await page.click('button:has-text("Next")');
    
    // Verify pincode validation error
    await expect(page.locator('.error-message')).toContainText('Invalid pincode format');
  });

  test('Document upload error handling', async ({ page }) => {
    // Login as Owner
    await page.selectOption('select[name="role"]', 'OWNER');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/register-society');

    // Navigate to documents step
    await page.fill('input[name="societyName"]', 'Test Society');
    await page.fill('input[name="societyAddress"]', '123 Test Street');
    await page.fill('input[name="societyCity"]', 'Test City');
    await page.fill('input[name="societyState"]', 'Test State');
    await page.fill('input[name="societyPincode"]', '123456');
    await page.click('button:has-text("Next")');
    
    await page.fill('input[name="chairmanName"]', 'John Chairman');
    await page.fill('input[name="chairmanPhone"]', '+1234567890');
    await page.fill('input[name="secretaryName"]', 'Jane Secretary');
    await page.fill('input[name="secretaryPhone"]', '+1234567891');
    await page.fill('input[name="treasurerName"]', 'Bob Treasurer');
    await page.fill('input[name="treasurerPhone"]', '+1234567892');
    await page.click('button:has-text("Next")');

    // Try to upload invalid file type
    const invalidFile = Buffer.from('Invalid file content');
    await page.setInputFiles('input[type="file"][data-document-type="PAN"]', {
      name: 'invalid-file.txt',
      mimeType: 'text/plain',
      buffer: invalidFile,
    });

    // Verify error message
    await expect(page.locator('.upload-error')).toContainText('Invalid file type');
  });

  test('Payment failure handling', async ({ page }) => {
    // Login as Owner
    await page.selectOption('select[name="role"]', 'OWNER');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/register-society');

    // Navigate to payment step
    await page.fill('input[name="societyName"]', 'Test Society');
    await page.fill('input[name="societyAddress"]', '123 Test Street');
    await page.fill('input[name="societyCity"]', 'Test City');
    await page.fill('input[name="societyState"]', 'Test State');
    await page.fill('input[name="societyPincode"]', '123456');
    await page.click('button:has-text("Next")');
    
    await page.fill('input[name="chairmanName"]', 'John Chairman');
    await page.fill('input[name="chairmanPhone"]', '+1234567890');
    await page.fill('input[name="secretaryName"]', 'Jane Secretary');
    await page.fill('input[name="secretaryPhone"]', '+1234567891');
    await page.fill('input[name="treasurerName"]', 'Bob Treasurer');
    await page.fill('input[name="treasurerPhone"]', '+1234567892');
    await page.click('button:has-text("Next")');

    // Upload documents
    const testFile = Buffer.from('Test document content');
    await page.setInputFiles('input[type="file"][data-document-type="PAN"]', {
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: testFile,
    });
    await page.click('button:has-text("Next")');

    // Simulate payment failure
    await page.evaluate(() => {
      localStorage.setItem('paymentStatus', 'FAILED');
    });

    // Click proceed to payment
    await page.click('button:has-text("Proceed to Payment")');
    
    // Wait for payment processing
    await page.waitForTimeout(2000);
    
    // Verify payment failure message
    await expect(page.locator('.payment-error')).toContainText('Payment failed');
    
    // Verify retry option is available
    await expect(page.locator('button:has-text("Retry Payment")')).toBeVisible();
  });
});

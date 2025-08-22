import { validate } from 'class-validator';
import { CreateRegistrationDto } from './create-registration.dto';

describe('CreateRegistrationDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = new CreateRegistrationDto();
    dto.funnelStage = 'INITIATED';
    dto.notes = 'Test registration';

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate empty DTO (all fields optional)', async () => {
    const dto = new CreateRegistrationDto();
    // All fields are optional, so this should be valid

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate notes length constraints', async () => {
    const dto = new CreateRegistrationDto();
    dto.funnelStage = 'INITIATED';
    dto.notes = 'a'.repeat(1001); // Exceeds max length

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });

  it('should validate notes minimum length when provided', async () => {
    const dto = new CreateRegistrationDto();
    dto.funnelStage = 'INITIATED';
    dto.notes = ''; // Empty string should fail minLength validation

    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toHaveProperty('minLength');
  });
});

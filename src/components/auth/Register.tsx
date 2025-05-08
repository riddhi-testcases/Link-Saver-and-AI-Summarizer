import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormData>();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await signUp(data.email, data.password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm space-y-4">
            <Input
              label="Email address"
              type="email"
              {...register('email', { required: 'Email is required' })}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              })}
              error={errors.password?.message}
            />
            <Input
              label="Confirm Password"
              type="password"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val: string) => {
                  if (watch('password') !== val) {
                    return 'Passwords do not match';
                  }
                }
              })}
              error={errors.confirmPassword?.message}
            />
          </div>

          <div>
            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
            >
              Create Account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
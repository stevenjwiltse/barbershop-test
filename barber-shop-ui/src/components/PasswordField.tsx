import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Box, FormControl, FormHelperText, IconButton, InputAdornment, InputLabel, OutlinedInput } from "@mui/material";
import { MouseEvent, useState } from "react";
import { Path, UseFormRegister } from "react-hook-form";


type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  name: Path<any>;
  register?: UseFormRegister<any>;
  required: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error: boolean;
};

const PasswordField = ({
  id,
  label,
  value,
  name,
  required,
  onChange,
  error,
  register,
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleMouseDownPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <FormControl>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <OutlinedInput
        id={id}
        label={label}
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        value={value}
        required={required}
        error={error}
        {...(register && register(name, { required, onChange }))}
        onChange={onChange}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label={showPassword ? "hidePassword" : "showPassword"}
              aria-controls="password"
              onClick={() => setShowPassword((show) => !show)}
              onMouseDown={handleMouseDownPassword}
              onMouseUp={handleMouseUpPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        }
      />
      <FormHelperText error={error}>
        {error ? "Passwords do not match" : ""}
      </FormHelperText>
    </FormControl>
  );
};

export default PasswordField;
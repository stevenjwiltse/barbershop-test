import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import {
  createUserApiV1UsersPost,
  UserCreate,
} from "../api";
import { useKeycloak } from "../hooks/useKeycloak";
import { useForm, SubmitHandler, FieldError } from "react-hook-form";
import PasswordField from "../components/PasswordField";

export default function Signup() {
  const { keycloak, authenticated } = useKeycloak();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function validatePassword() {
    return password === confirmPassword;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserCreate>();

  const onSubmit: SubmitHandler<UserCreate> = async (createData) => {
    if (!validatePassword()) {
      return;
    }
    try {
      const { data, error, response } = await createUserApiV1UsersPost({
        body: createData,
      });
      if (data) {
        keycloak?.login({
          redirectUri: window.location.origin + "/",
        });
      }
    } catch (err) {
      console.error(`Unexpected error: ${err}`);
    }
  };

  return (
    <Box
      sx={{ justifyContent: "center", alignItems: "center", height: "100vh" }}
    >
      <Card sx={{ maxWidth: 600, margin: "auto", mt: 4 }}>
        <CardContent>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h4">Sign Up</Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              component="p"
              sx={{ mt: 1, textAlign: "center" }}
            >
              Provide details for your new account
            </Typography>
          </Box>
          <Box sx={{ mt: 2 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <TextField
                  id="txt-first-name"
                  label="First Name"
                  {...register("firstName", { required: true })}
                  helperText={errors.firstName ? "First Name is required" : ""}
                  error={errors.firstName ? true : false}
                />
                <TextField
                  id="txt-last-name"
                  label="Last Name"
                  {...register("lastName", { required: true })}
                  helperText={errors.lastName ? "Last Name is required" : ""}
                  error={errors.lastName ? true : false}
                />
                <TextField
                  id="txt-email"
                  label="Email"
                  {...register("email", { required: true })}
                  helperText={errors.email ? errors.email.message : ""}
                  error={errors.email ? true : false}
                />
                <TextField
                  id="txt-phone-number"
                  label="Phone Number"
                  {...register("phoneNumber", { required: true })}
                  helperText={
                    errors.phoneNumber ? errors.phoneNumber.message : ""
                  }
                  error={errors.phoneNumber ? true : false}
                />
                <PasswordField
                  id="txt-password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={false}
                  register={register}
                  required
                  name="password"
                />
                <PasswordField
                  id="txt-confirm-password"
                  label="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={!validatePassword()}
                  name="password"
                  required
                />
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    By clicking Sign Up, you agree to our Terms, Data Policy and
                    Cookies Policy.
                  </Typography>
                </Box>
                <Button variant="contained" type="submit">
                  Sign up
                </Button>
              </Stack>
            </form>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

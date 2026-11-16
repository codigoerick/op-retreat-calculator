import LoginForm from "./LoginForm";

type LoginPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const errorCode = Array.isArray(params.error)
    ? params.error[0]
    : params.error;

  let initialError = "";

  if (errorCode === "forbidden") {
    initialError = "Esta cuenta no tiene permisos de administrador.";
  } else if (errorCode === "recovery") {
    initialError = "El enlace de recuperación expiró o no es válido.";
  }

  return <LoginForm key={initialError} initialError={initialError} />;
}

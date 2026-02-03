import { GoogleIcon } from "@/assets/icons";

export default function GoogleSigninButton({ text }: { text: string }) {
  return (
    <button className="flex w-full items-center justify-center gap-3.5 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-[15px] font-medium text-[hsl(var(--foreground))] hover:bg-opacity-50 dark:border-[hsl(var(--border))] dark:bg-[hsl(var(--secondary))] dark:hover:bg-opacity-50">
      <GoogleIcon />
      {text} with Google
    </button>
  );
}
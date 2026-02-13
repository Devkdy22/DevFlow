type TopToastProps = {
  message: string;
};

export function TopToast({ message }: TopToastProps) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60]">
      <div className="rounded-full bg-slate-900 text-white px-4 py-2 text-sm shadow-lg">
        {message}
      </div>
    </div>
  );
}

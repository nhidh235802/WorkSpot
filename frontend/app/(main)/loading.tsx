export default function MainLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF5]">
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-[#D7DED8] border-t-[#14422D]"
          aria-hidden="true"
        />
        <p className="text-base font-semibold text-[#14422D]">読み込み中...</p>
      </div>
    </div>
  );
}

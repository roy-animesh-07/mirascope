const Footer = () => {
  return (
    <footer className="w-full mt-16 bg-green-100 border-t border-green-200 text-green-900">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">

        <p className="font-medium">
          © {new Date().getFullYear()} MiraScope
        </p>

        <p>
          Built by{" "}
          <span className="font-semibold text-green-700">
            Animesh Roy
          </span>
        </p>

        <p className="text-green-700/70">
          WebCSE · Winter Project
        </p>

      </div>
    </footer>
  );
};

export default Footer;

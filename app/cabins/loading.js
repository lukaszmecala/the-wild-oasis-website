import Spinner from "@/app/_components/Spinner";

function Loading() {
  return (
    <div className="grid items-center justify-center">
      <Spinner />
      <p className="text-primary-200 text-lg mt-4">
        Loading cabins, please wait...
      </p>
    </div>
  );
}

export default Loading;

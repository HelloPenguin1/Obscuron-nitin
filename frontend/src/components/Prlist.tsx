import axios from "axios";
import { useEffect, useState, useId, useRef } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "./hooks/use-outside-click";
import { Bounty } from "./bounty";
import { BountyApp } from "./BountyApp";

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};

interface PrCard {
  title: string;
  description: string;
  src: string;
  ctaText: string;
  ctaLink: string;
  content: () => JSX.Element;
  prDetails: any;
  contributor: string;
}

const Prlist = () => {
  const { owner, name } = useParams();
  const [prs, setPrs] = useState<PrCard[]>([]);
  const [active, setActive] = useState<PrCard | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {

    const getPrs = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/github/repos/${owner}/${name}`, {
          headers: {
            Authorization: JSON.parse(localStorage.getItem("token") as string)
          }
        });
        const result = await response.data;

        // Map the fetched PRs to the PrCard format
        const formattedPrs: PrCard[] = result.prs.map((pr: any) => ({
          title: pr.title,
          description: `PR by ${pr.user.login} on ${new Date(pr.created_at).toLocaleDateString()}`,
          src: pr.user.avatar_url || "https://via.placeholder.com/100",
          ctaText: "View PR",
          ctaLink: pr.html_url,
          content: () => (
            <div>
              <p><strong>State:</strong> {pr.state}</p>
              <p><strong>Created At:</strong> {new Date(pr.created_at).toLocaleString()}</p>
              <p><strong>Updated At:</strong> {new Date(pr.updated_at).toLocaleString()}</p>
              {pr.body && (
                <>
                  <p><strong>Description:</strong></p>
                  <p>{pr.body}</p>
                </>
              )}
              <p><a href={pr.html_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Go to GitHub PR</a></p>
            </div>
          ),
          prDetails: pr,
          contributor : pr.user.login
        }));
        setPrs(formattedPrs);
      }
      catch (error) {
        toast.error("Something went wrong");
        console.log(error);
      }
    }

    getPrs();
  }, [owner, name]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <div className="p-4 min-h-screen bg-[#0A0A0A]">
      <h1 className="text-2xl font-bold mb-6 text-center">Pull Requests for {owner}/{name}</h1>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0  grid place-items-center z-[100]">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />

            </motion.button>
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[500px]  h-full md:h-fit md:max-h-[90%]  flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`image-${active.title}-${id}`}>
                <img
                  width={200}
                  height={200}
                  src={active.src}
                  alt={active.title}
                  className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                />
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div className="">
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-bold text-neutral-700 dark:text-neutral-200"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      {active.description}
                    </motion.p>
                  </div>

                  <motion.a
                    layoutId={`button-${active.title}-${id}`}
                    href={active.ctaLink}
                    target="_blank"
                    className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white"
                  >
                    {active.ctaText}
                  </motion.a>
                </div>
                <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch]"
                  >
                    {typeof active.content === "function"
                      ? active.content()
                      : active.content}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <ul className="max-w-2xl mx-auto w-full gap-4">
        {prs.length > 0 ? (
          prs.map((pr) => (
            <motion.div
              layoutId={`card-${pr.title}-${id}`}
              key={`card-${pr.title}-${id}`}
              onClick={() => setActive(pr)}
              className="p-4 flex flex-col md:flex-row justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
            >
              <div className="flex gap-4 flex-col md:flex-row ">
                <motion.div layoutId={`image-${pr.title}-${id}`}>
                  <img
                    width={100}
                    height={100}
                    src={pr.src}
                    alt={pr.title}
                    className="h-14 w-14 rounded-full object-cover object-top"
                  />
                </motion.div>
                <div className="">
                  <motion.h3
                    layoutId={`title-${pr.title}-${id}`}
                    className="font-medium text-neutral-800 dark:text-neutral-200 text-center md:text-left"
                  >
                    {pr.title}
                  </motion.h3>
                  <motion.p
                    layoutId={`description-${pr.description}-${id}`}
                    className="text-neutral-600 dark:text-neutral-400 text-center md:text-left"
                  >
                    {pr.description}
                  </motion.p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <motion.button
                  layoutId={`button-${pr.title}-${id}`}
                  className="px-4 py-2 text-sm rounded-full font-bold bg-gray-100 hover:bg-green-500 hover:text-white text-black"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(pr.ctaLink, "_blank");
                  }}
                >
                  {pr.ctaText}
                </motion.button>
                <span onClick={(e) => {
                  e.stopPropagation()
                }}>
                  {/* <Bounty contributor={pr.contributor}/> */}
                  <BountyApp/>
                </span>
              </div>


            </motion.div>
          ))
        ) : (
          <p className="text-center text-neutral-500">No pull requests found.</p>
        )}
      </ul>
    </div>
  );
}

export default Prlist;
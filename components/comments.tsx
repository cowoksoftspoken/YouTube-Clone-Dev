"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatPublishedDate, formatViews } from "@/lib/utils";
import EmojiPicker from "emoji-picker-react";
import Notification from "./notification";
import {
  fetchComments,
  fetchCommentReplies,
  fetchChannelDetails,
  commentVideo,
} from "@/lib/youtube-api";
import {
  ThumbsUp,
  ThumbsDown,
  ChevronUp,
  ChevronDown,
  BadgeCheck,
  X,
  Smile,
  SendHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Textarea } from "./ui/textarea";

interface Comment {
  id: string;
  snippet: {
    topLevelComment: {
      snippet: {
        authorDisplayName: string;
        authorProfileImageUrl: string;
        authorChannelId: {
          value: string;
        };
        textDisplay: string;
        likeCount: number;
        publishedAt: string;
      };
    };
    totalReplyCount: number;
  };
}

interface Reply {
  id: string;
  snippet: {
    authorDisplayName: string;
    authorProfileImageUrl: string;
    authorChannelId: string;
    textDisplay: string;
    likeCount: number;
    publishedAt: string;
  };
}

interface CommentsProps {
  videoId: string;
  authorChannelId: string;
}

export default function Comments({ videoId, authorChannelId }: CommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState<{
    [key: string]: boolean;
  }>({});
  const [replies, setReplies] = useState<{ [key: string]: Reply[] }>({});
  const [verifiedChannels, setVerifiedChannels] = useState<{
    [key: string]: boolean;
  }>({});
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [randomCommentIndex, setRandomCommentIndex] = useState(0);
  const [focus, setFocus] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputMobileRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<{
    type: "error" | "info" | "success";
    message: string;
  }>({
    type: "info",
    message: "",
  });
  const firstRender = useRef(true);

  const { ref, inView } = useInView();

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth <= 768);
    };
    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  const loadComments = useCallback(
    async (pageToken: string | null = null) => {
      try {
        const fetchedComments = await fetchComments(videoId, pageToken);
        setComments((prevComments) => [
          ...prevComments,
          ...fetchedComments.items,
        ]);
        setNextPageToken(fetchedComments.nextPageToken || null);

        const uniqueChannelIds: Set<string> = new Set(
          fetchedComments.items
            .map(
              (comment: Comment) =>
                comment.snippet.topLevelComment.snippet.authorChannelId?.value
            )
            .filter(Boolean)
        );

        const channelDetailsPromises = Array.from(uniqueChannelIds).map(
          async (channelId: string) => {
            try {
              const channelDetails = await fetchChannelDetails(channelId);
              const isVerified =
                Number.parseInt(channelDetails.statistics.subscriberCount) >=
                100000;
              return [channelId, isVerified];
            } catch (error) {
              console.error(
                `Error fetching channel details for ${channelId}:`,
                error
              );
              return [channelId, false];
            }
          }
        );

        const channelVerificationStatus = Object.fromEntries(
          await Promise.all(channelDetailsPromises)
        );
        setVerifiedChannels((prevStatus) => ({
          ...prevStatus,
          ...channelVerificationStatus,
        }));
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setLoading(false);
      }
    },
    [videoId]
  );

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      loadComments();
      return;
    }

    if (inView && nextPageToken) {
      loadComments(nextPageToken);
    }
  }, [inView]);

  useEffect(() => {
    if (comments.length > 0 && isMobileView) {
      setRandomCommentIndex(Math.floor(Math.random() * comments.length));
    }
  }, [comments]);

  const handleViewReplies = useCallback(
    async (commentId: string) => {
      if (expandedComments[commentId]) {
        setExpandedComments({ ...expandedComments, [commentId]: false });
      } else {
        try {
          const fetchedReplies = await fetchCommentReplies(commentId);
          setReplies({ ...replies, [commentId]: fetchedReplies.items });
          setExpandedComments({ ...expandedComments, [commentId]: true });
        } catch (error) {
          console.error("Error fetching replies:", error);
        }
      }
    },
    [expandedComments, replies]
  );

  const clickedEmoji = (event: any, viewport: "mobile" | "desktop") => {
    if (viewport === "desktop") {
      setQuery((prev) => prev + event.emoji);
    } else {
      inputMobileRef.current += event.emoji;
    }
    setOpen(false);
  };

  const handleComments = async () => {
    const response = await commentVideo(videoId, query, session?.accessToken);
    if (response) {
      setQuery("");
      loadComments();
      setStatus({
        type: "success",
        message: "Successful comment",
      });
    } else if (!response) {
      setStatus({
        type: "error",
        message: "Something went wrong.",
      });
    }
  };

  const AuthorName = ({
    name,
    channelId,
    className,
  }: {
    name: string;
    channelId: string;
    isReply?: boolean;
    className?: string;
  }) => {
    const isAuthor = channelId === authorChannelId;
    const isVerified = verifiedChannels[channelId];

    return (
      <div className="flex items-center gap-1">
        <span
          className={cn(
            "font-semibold",
            isAuthor &&
              "bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-sm",
            className
          )}
        >
          <Link href={`/channel/${channelId}`}>{name}</Link>
        </span>
        {isVerified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
      </div>
    );
  };

  const CommentCard = ({
    comment,
    isRandom,
  }: {
    comment: Comment;
    isRandom?: boolean;
  }) => {
    const [isRepliesExpanded, setIsRepliesExpanded] = useState(false);

    return (
      <div
        className={`rounded-lg shadow-md space-y-4 w-full ${
          isRandom ? "dark:bg-[#272829] p-4 bg-slate-100" : "bg-card p-2"
        }`}
      >
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage
              srcSet={
                comment.snippet.topLevelComment.snippet.authorProfileImageUrl
              }
              decoding="async"
              loading="lazy"
              src={
                comment.snippet.topLevelComment.snippet.authorProfileImageUrl
              }
            />
            <AvatarFallback>
              {comment.snippet.topLevelComment.snippet.authorDisplayName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <AuthorName
                name={comment.snippet.topLevelComment.snippet.authorDisplayName}
                className="text-sm"
                channelId={
                  comment.snippet.topLevelComment.snippet.authorChannelId.value
                }
              />
              <span className="text-xs text-muted-foreground">
                {formatPublishedDate(
                  new Date(comment.snippet.topLevelComment.snippet.publishedAt)
                )}
              </span>
            </div>
            <p
              className="mt-1 text-sm"
              dangerouslySetInnerHTML={{
                __html: isRandom
                  ? comment.snippet.topLevelComment.snippet.textDisplay.slice(
                      0,
                      150
                    ) + "..."
                  : comment.snippet.topLevelComment.snippet.textDisplay,
              }}
            />
            <div
              className={`flex items-center space-x-4 mt-2 ${
                isRandom ? "hidden" : ""
              }`}
            >
              <Button
                variant="ghost"
                className="flex items-center gap-3 p-0"
                size="sm"
              >
                <ThumbsUp className="h-4 w-4" />{" "}
                {formatViews(comment.snippet.topLevelComment.snippet.likeCount)}
              </Button>
              <Button variant="ghost" size="sm">
                <ThumbsDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                Reply
              </Button>
            </div>
          </div>
        </div>
        {comment.snippet.totalReplyCount > 0 && !isRandom && (
          <div className="ml-10">
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                setIsRepliesExpanded(!isRepliesExpanded);
                if (!isRepliesExpanded && !replies[comment.id]) {
                  handleViewReplies(comment.id);
                }
              }}
              className="flex items-center space-x-2 text-indigo-500"
            >
              {isRepliesExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
              <span>
                {isRepliesExpanded
                  ? "Hide replies"
                  : `View ${comment.snippet.totalReplyCount} ${
                      comment.snippet.totalReplyCount === 1
                        ? "reply"
                        : "replies"
                    }`}
              </span>
            </Button>
            {isRepliesExpanded && replies[comment.id] && (
              <div className="space-y-4 mt-4">
                {replies[comment.id].map((reply) => (
                  <div key={reply.id} className="flex space-x-4">
                    <Avatar>
                      <AvatarImage
                        loading="lazy"
                        decoding="async"
                        srcSet={reply.snippet.authorProfileImageUrl}
                        src={reply.snippet.authorProfileImageUrl}
                        alt={reply.snippet.authorDisplayName}
                      />
                      <AvatarFallback>
                        {reply.snippet.authorDisplayName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">
                          {reply.snippet.authorDisplayName}
                        </h4>
                        <span className="text-sm text-muted-foreground">
                          {formatPublishedDate(
                            new Date(reply.snippet.publishedAt)
                          )}
                        </span>
                      </div>
                      <p
                        className="mt-1 prose dark:prose-invert prose-p:m-0 prose-h1:m-0 prose-h2:m-0 prose-h3:m-0 prose-h4:m-0 prose-h5:m-0 prose-h6:m-0 prose-a:m-0 prose-ul:m-0 prose-li:m-0 prose-ol:m-0 word-break break-words"
                        dangerouslySetInnerHTML={{
                          __html: reply.snippet.textDisplay,
                        }}
                      />
                      <div className="flex items-center space-x-4 mt-2">
                        <Button
                          variant="ghost"
                          className="flex items-center gap-3 p-0"
                          size="sm"
                        >
                          <ThumbsUp className="h-4 w-4" />{" "}
                          {formatViews(reply.snippet.likeCount)}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ThumbsDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading && comments.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="loader"></span>
        <span className="sr-only">Loading comments...</span>
      </div>
    );
  }

  const handleInputRef = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (inputMobileRef.current) {
      inputMobileRef.current.value = e.target.value;
    }
  };

  return (
    <>
      {isMobileView ? (
        <>
          <AnimatePresence>
            {isCommentsOpen && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed inset-0 dark:bg-[#4d4e4e] bg-slate-100 shadow-md z-50 overflow-hidden"
              >
                <div className="h-full dark:bg-background bg-white flex flex-col">
                  <div className="flex justify-between items-center p-4 border-b">
                    <div className="text-md font-bold flex items-center gap-2">
                      {" "}
                      {comments.length} Comments
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 text-md"
                      >
                        <svg
                          height="48"
                          viewBox="0 0 48 48"
                          className="h-4 w-4 text-black dark:text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                        >
                          <path d="M6 36h12v-4h-12v4zm0-24v4h36v-4h-36zm0 14h24v-4h-24v4z" />
                          <path d="M0 0h48v48h-48z" fill="none" />
                        </svg>
                        Sort by
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsCommentsOpen(false)}
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                  <div className="fixed flex flex-1 bottom-0 bg-background z-50 w-full p-2 items-center gap-2 dark:bg-[#272829] bg-slate-100">
                    <div className="layer pointer-events-none flex-shrink-0">
                      <img
                        src={
                          (session?.user?.image as string) ||
                          "/placeholder.avif"
                        }
                        alt={(session?.user?.name as string) || "Not Logged In"}
                        className="w-8 h-8 rounded-full shrink-0"
                      />
                    </div>
                    <input
                      type="text"
                      className="bg-none rounded-md w-full placeholder:text-sm text-sm outline-none p-2 placeholder:px-2"
                      ref={inputMobileRef}
                      onChange={handleInputRef}
                      placeholder="Add Comments..."
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-5 h-5"
                      onClick={() => handleComments()}
                    >
                      <SendHorizontal className="h-8 w-8" />
                    </Button>
                  </div>
                  <div className="flex-1 bg-background overflow-y-auto p-4 space-y-4">
                    {comments.map((comment, i) => (
                      <CommentCard key={i} comment={comment} />
                    ))}
                    {nextPageToken && <div ref={ref} className="h-10" />}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {!isCommentsOpen && comments.length > 0 && (
            <div
              className="mt-4 cursor-pointer"
              onClick={() => setIsCommentsOpen(true)}
            >
              <CommentCard comment={comments[randomCommentIndex]} isRandom />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center justify-between space-x-4 mb-4">
            <h2 className="text-2xl font-bold mb-4">
              {comments.length} Comments
            </h2>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-md"
            >
              <svg
                height="48"
                viewBox="0 0 48 48"
                className="h-6 w-6 text-black dark:text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
              >
                <path d="M6 36h12v-4h-12v4zm0-24v4h36v-4h-36zm0 14h24v-4h-24v4z" />
                <path d="M0 0h48v48h-48z" fill="none" />
              </svg>
              Sort by
            </Button>
          </div>
          <div
            className={`flex gap-2 items-center ${
              focus ? "mb-[3.8rem]" : "mb-8"
            }`}
          >
            <div className="layer pointer-events-none">
              <Avatar>
                <AvatarImage
                  src={(session?.user?.image as string) || "/placeholder.avif"}
                  alt={(session?.user?.name as string) || "Not Logged In"}
                  className="w-10 h-10"
                />
                <AvatarFallback>{session?.user?.name as string}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col w-full relative">
              <input
                className="bg-background border-b-2 dark:border-b-[#272829] dark:text-white border-gray-[#272829] focus:border-b-[#272829] text-black outline-none dark:focus:border-b-white text-sm w-full placeholder:text-sm"
                placeholder="Add comments..."
                type="text"
                onFocus={() => setFocus((prev) => !prev)}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div
                className={`absolute bottom-[-50px] left-0 w-full flex justify-between items-center transition-all ${
                  focus ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
              >
                <div className="absolute top-5 left-10">
                  <EmojiPicker
                    open={open}
                    onEmojiClick={(e) => clickedEmoji(e, "desktop")}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen((prev) => !prev)}
                >
                  <Smile className="h-6 w-6" />
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFocus(false)}
                  >
                    Cancel
                  </Button>
                  <button
                    className="dark:disabled:bg-gray-600 disabled:opacity-50 disabled:text-opacity-60 dark:bg-blue-500 rounded-full dark:text-white bg-black text-white text-sm p-2"
                    disabled={query.length === 0 ? true : false}
                    onClick={() => handleComments()}
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {comments.map((comment, i) => (
              <div key={i} className="space-y-4 overflow-y-auto">
                <div className="flex space-x-4">
                  <Avatar>
                    <AvatarImage
                      src={
                        comment.snippet.topLevelComment.snippet
                          .authorProfileImageUrl
                      }
                      decoding="async"
                      loading="lazy"
                    />
                    <AvatarFallback>
                      {
                        comment.snippet.topLevelComment.snippet
                          .authorDisplayName[0]
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 w-[88%]">
                    <div className="flex items-center space-x-2">
                      <AuthorName
                        name={
                          comment.snippet.topLevelComment.snippet
                            .authorDisplayName
                        }
                        channelId={
                          comment.snippet.topLevelComment.snippet
                            .authorChannelId.value
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {formatPublishedDate(
                          new Date(
                            comment.snippet.topLevelComment.snippet.publishedAt
                          )
                        )}
                      </span>
                    </div>
                    <p
                      className="mt-1 max-w-[100%] prose dark:prose-invert prose-p:m-0 prose-h1:m-0 prose-h2:m-0 prose-h3:m-0 prose-h4:m-0 prose-h5:m-0 prose-h6:m-0 prose-a:m-0 prose-ul:m-0 prose-li:m-0 prose-ol:m-0 overflow-hidden word-break break-words"
                      dangerouslySetInnerHTML={{
                        __html:
                          comment.snippet.topLevelComment.snippet.textDisplay,
                      }}
                    />
                    <div className="flex items-center space-x-4 mt-2">
                      <Button
                        variant="ghost"
                        className="flex items-center gap-3 p-0"
                        size="sm"
                      >
                        <ThumbsUp className="h-4 w-4" />{" "}
                        {formatViews(
                          comment.snippet.topLevelComment.snippet.likeCount
                        )}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
                {comment.snippet.totalReplyCount > 0 && (
                  <div className="ml-10">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleViewReplies(comment.id)}
                      className="flex items-center space-x-2 text-indigo-500"
                    >
                      {expandedComments[comment.id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <span>
                        {expandedComments[comment.id]
                          ? "Hide replies"
                          : `View ${comment.snippet.totalReplyCount} ${
                              comment.snippet.totalReplyCount === 1
                                ? "reply"
                                : "replies"
                            }`}
                      </span>
                    </Button>
                    {expandedComments[comment.id] && replies[comment.id] && (
                      <div className="space-y-4 mt-4">
                        {replies[comment.id].map((reply, i) => (
                          <div key={i} className="flex space-x-4">
                            <Avatar>
                              <AvatarImage
                                decoding="async"
                                src={reply.snippet.authorProfileImageUrl}
                              />
                              <AvatarFallback>
                                {reply.snippet.authorDisplayName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold">
                                  {reply.snippet.authorDisplayName}
                                </h4>
                                <span className="text-sm text-muted-foreground">
                                  {formatPublishedDate(
                                    new Date(reply.snippet.publishedAt)
                                  )}
                                </span>
                              </div>
                              <p
                                className="mt-1 prose dark:prose-invert prose-p:m-0 prose-h1:m-0 prose-h2:m-0 prose-h3:m-0 prose-h4:m-0 prose-h5:m-0 prose-h6:m-0 prose-a:m-0 prose-ul:m-0 prose-li:m-0 prose-ol:m-0 word-break break-words"
                                dangerouslySetInnerHTML={{
                                  __html: reply.snippet.textDisplay,
                                }}
                              />
                              <div className="flex items-center space-x-4 mt-2">
                                <Button
                                  variant="ghost"
                                  className="flex items-center gap-3 p-0"
                                  size="sm"
                                >
                                  <ThumbsUp className="h-4 w-4" />{" "}
                                  {formatViews(reply.snippet.likeCount)}
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <ThumbsDown className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {status.message !== "" && (
                  <Notification
                    type={status.type}
                    text={status.message}
                    duration={3000}
                  />
                )}
              </div>
            ))}
            {nextPageToken && <div ref={ref} className="h-10" />}
          </div>
        </>
      )}
    </>
  );
}

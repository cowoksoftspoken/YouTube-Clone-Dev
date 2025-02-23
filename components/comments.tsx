"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatPublishedDate, formatViews } from "@/lib/utils";
import {
  fetchComments,
  fetchCommentReplies,
  fetchChannelDetails,
} from "@/lib/youtube-api";
import {
  ThumbsUp,
  ThumbsDown,
  ChevronUp,
  ChevronDown,
  BadgeCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";

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
    loadComments();
  }, [videoId]);

  useEffect(() => {
    if (inView && nextPageToken) {
      loadComments(nextPageToken);
    }
  }, [inView, nextPageToken]);

  useEffect(() => {
    if (comments.length > 0) {
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

  const AuthorName = ({
    name,
    channelId,
  }: {
    name: string;
    channelId: string;
    isReply?: boolean;
  }) => {
    const isAuthor = channelId === authorChannelId;
    const isVerified = verifiedChannels[channelId];

    return (
      <div className="flex items-center gap-1">
        <span
          className={cn(
            "font-semibold",
            isAuthor &&
              "bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-sm"
          )}
        >
          <Link href={`/channel/${channelId}`}>{name}</Link>
        </span>
        {isVerified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
      </div>
    );
  };

  const CommentCard = ({ comment }: { comment: Comment }) => {
    const [isRepliesExpanded, setIsRepliesExpanded] = useState(false);

    return (
      <div className="bg-card p-4 rounded-lg shadow-md space-y-4">
        <div className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage
              src={
                comment.snippet.topLevelComment.snippet.authorProfileImageUrl
              }
            />
            <AvatarFallback>
              {comment.snippet.topLevelComment.snippet.authorDisplayName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <AuthorName
              name={comment.snippet.topLevelComment.snippet.authorDisplayName}
              channelId={
                comment.snippet.topLevelComment.snippet.authorChannelId.value
              }
            />
            <p
              className="mt-1"
              dangerouslySetInnerHTML={{
                __html: comment.snippet.topLevelComment.snippet.textDisplay,
              }}
            />
            <div className="flex items-center space-x-4 mt-2">
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
        {comment.snippet.totalReplyCount > 0 && (
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
                      <AvatarImage src={reply.snippet.authorProfileImageUrl} />
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
    return <span className="loader">Loading comments...</span>;
  }

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
                className="fixed inset-0 bg-background z-50 overflow-hidden"
              >
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">Comments</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsCommentsOpen(false)}
                    >
                      <X className="h-6 w-6" />
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
              <CommentCard comment={comments[randomCommentIndex]} />
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
              </div>
            ))}
            {nextPageToken && <div ref={ref} className="h-10" />}
          </div>
        </>
      )}
    </>
  );
}

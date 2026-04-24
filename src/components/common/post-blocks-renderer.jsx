import React from "react";

const widthClassMap = {
  small: "max-w-sm",
  normal: "max-w-2xl",
  wide: "max-w-4xl",
  full: "max-w-none w-full",
};

const alignClassMap = {
  left: "mr-auto",
  center: "mx-auto",
  right: "ml-auto",
};

export function PostBlocksRenderer({ blocks = [], fallbackContent = "", fallbackImage = "", title = "" }) {
  const normalizedBlocks = Array.isArray(blocks)
    ? blocks.filter((b) => b && (b.type === "text" || b.type === "image" || b.type === "heading"))
    : [];

  if (normalizedBlocks.length === 0) {
    return (
      <div className="space-y-4">
        {fallbackImage ? (
          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
            <img src={fallbackImage} alt={title} className="w-full max-h-[420px] object-cover" />
          </div>
        ) : null}
        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{fallbackContent}</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {normalizedBlocks.map((block, idx) => {
        if (block.type === "heading") {
          return (
            <h3 key={`heading-${idx}`} className="text-lg font-bold text-gray-900 leading-relaxed">
              {block.text}
            </h3>
          );
        }

        if (block.type === "text") {
          return (
            <p key={`text-${idx}`} className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {block.text}
            </p>
          );
        }

        return (
          <div
            key={`img-${idx}`}
            className={`rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 ${widthClassMap[block.image_width] || widthClassMap.wide} ${alignClassMap[block.image_align] || alignClassMap.center}`}
          >
            <img src={block.image_url} alt={`${title} ${idx + 1}`} className="w-full h-auto object-cover" />
            {block.image_caption ? (
              <div className="px-3 py-2 text-xs text-gray-500 bg-white border-t border-gray-200">
                {block.image_caption}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default PostBlocksRenderer;

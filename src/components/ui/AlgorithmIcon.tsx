interface AlgorithmIconProps {
  className?: string;
  variant?: "sorting" | "graph" | "tree" | "array";
}

export function AlgorithmIcon({
  className = "w-16 h-16",
  variant = "sorting",
}: AlgorithmIconProps) {
  const icons = {
    sorting: (
      <svg
        viewBox="0 0 100 100"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.8">
          {/* Animated bars representing sorting */}
          <rect
            x="10"
            y="60"
            width="8"
            height="30"
            fill="url(#grad1)"
            className="animation-delay-100 animate-pulse"
          />
          <rect
            x="25"
            y="45"
            width="8"
            height="45"
            fill="url(#grad2)"
            className="animation-delay-200 animate-pulse"
          />
          <rect
            x="40"
            y="30"
            width="8"
            height="60"
            fill="url(#grad3)"
            className="animation-delay-300 animate-pulse"
          />
          <rect
            x="55"
            y="70"
            width="8"
            height="20"
            fill="url(#grad1)"
            className="animation-delay-400 animate-pulse"
          />
          <rect
            x="70"
            y="50"
            width="8"
            height="40"
            fill="url(#grad2)"
            className="animation-delay-500 animate-pulse"
          />
          <rect
            x="85"
            y="35"
            width="8"
            height="55"
            fill="url(#grad3)"
            className="animation-delay-600 animate-pulse"
          />

          {/* Arrow indicating movement */}
          <path
            d="M15 25 L25 15 L35 25"
            stroke="url(#grad4)"
            strokeWidth="2"
            fill="none"
            className="animate-bounce-subtle"
          />
        </g>
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="1" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" stopOpacity="1" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="grad3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FB7185" stopOpacity="1" />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="grad4" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="1" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="1" />
          </linearGradient>
        </defs>
      </svg>
    ),
    graph: (
      <svg
        viewBox="0 0 100 100"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.8">
          {/* Graph nodes */}
          <circle
            cx="20"
            cy="20"
            r="6"
            fill="url(#nodeGrad1)"
            className="animation-delay-100 animate-pulse"
          />
          <circle
            cx="80"
            cy="20"
            r="6"
            fill="url(#nodeGrad2)"
            className="animation-delay-200 animate-pulse"
          />
          <circle
            cx="50"
            cy="50"
            r="6"
            fill="url(#nodeGrad3)"
            className="animation-delay-300 animate-pulse"
          />
          <circle
            cx="20"
            cy="80"
            r="6"
            fill="url(#nodeGrad1)"
            className="animation-delay-400 animate-pulse"
          />
          <circle
            cx="80"
            cy="80"
            r="6"
            fill="url(#nodeGrad2)"
            className="animation-delay-500 animate-pulse"
          />

          {/* Graph edges */}
          <path
            d="M20 20 L80 20"
            stroke="url(#edgeGrad)"
            strokeWidth="2"
            className="animate-pulse"
          />
          <path
            d="M20 20 L50 50"
            stroke="url(#edgeGrad)"
            strokeWidth="2"
            className="animation-delay-100 animate-pulse"
          />
          <path
            d="M80 20 L50 50"
            stroke="url(#edgeGrad)"
            strokeWidth="2"
            className="animation-delay-200 animate-pulse"
          />
          <path
            d="M50 50 L20 80"
            stroke="url(#edgeGrad)"
            strokeWidth="2"
            className="animation-delay-300 animate-pulse"
          />
          <path
            d="M50 50 L80 80"
            stroke="url(#edgeGrad)"
            strokeWidth="2"
            className="animation-delay-400 animate-pulse"
          />
        </g>
        <defs>
          <linearGradient id="nodeGrad1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="nodeGrad2">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
          <linearGradient id="nodeGrad3">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id="edgeGrad">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#C084FC" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>
    ),
    tree: (
      <svg
        viewBox="0 0 100 100"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.8">
          {/* Tree structure */}
          <circle
            cx="50"
            cy="15"
            r="5"
            fill="url(#treeGrad1)"
            className="animate-pulse"
          />
          <circle
            cx="30"
            cy="35"
            r="4"
            fill="url(#treeGrad2)"
            className="animation-delay-100 animate-pulse"
          />
          <circle
            cx="70"
            cy="35"
            r="4"
            fill="url(#treeGrad2)"
            className="animation-delay-100 animate-pulse"
          />
          <circle
            cx="20"
            cy="55"
            r="3"
            fill="url(#treeGrad3)"
            className="animation-delay-200 animate-pulse"
          />
          <circle
            cx="40"
            cy="55"
            r="3"
            fill="url(#treeGrad3)"
            className="animation-delay-200 animate-pulse"
          />
          <circle
            cx="60"
            cy="55"
            r="3"
            fill="url(#treeGrad3)"
            className="animation-delay-200 animate-pulse"
          />
          <circle
            cx="80"
            cy="55"
            r="3"
            fill="url(#treeGrad3)"
            className="animation-delay-200 animate-pulse"
          />

          {/* Tree connections */}
          <path d="M50 20 L30 30" stroke="url(#treeEdge)" strokeWidth="2" />
          <path d="M50 20 L70 30" stroke="url(#treeEdge)" strokeWidth="2" />
          <path d="M30 40 L20 50" stroke="url(#treeEdge)" strokeWidth="2" />
          <path d="M30 40 L40 50" stroke="url(#treeEdge)" strokeWidth="2" />
          <path d="M70 40 L60 50" stroke="url(#treeEdge)" strokeWidth="2" />
          <path d="M70 40 L80 50" stroke="url(#treeEdge)" strokeWidth="2" />
        </g>
        <defs>
          <linearGradient id="treeGrad1">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
          <linearGradient id="treeGrad2">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="treeGrad3">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="treeEdge">
            <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#64748B" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>
    ),
    array: (
      <svg
        viewBox="0 0 100 100"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.8">
          {/* Array visualization */}
          <rect
            x="10"
            y="40"
            width="15"
            height="15"
            fill="url(#arrayGrad1)"
            rx="2"
            className="animation-delay-100 animate-pulse"
          />
          <rect
            x="30"
            y="40"
            width="15"
            height="15"
            fill="url(#arrayGrad2)"
            rx="2"
            className="animation-delay-200 animate-pulse"
          />
          <rect
            x="50"
            y="40"
            width="15"
            height="15"
            fill="url(#arrayGrad3)"
            rx="2"
            className="animation-delay-300 animate-pulse"
          />
          <rect
            x="70"
            y="40"
            width="15"
            height="15"
            fill="url(#arrayGrad1)"
            rx="2"
            className="animation-delay-400 animate-pulse"
          />

          {/* Array indices */}
          <text
            x="17.5"
            y="35"
            textAnchor="middle"
            fill="white"
            fontSize="8"
            opacity="0.7"
          >
            0
          </text>
          <text
            x="37.5"
            y="35"
            textAnchor="middle"
            fill="white"
            fontSize="8"
            opacity="0.7"
          >
            1
          </text>
          <text
            x="57.5"
            y="35"
            textAnchor="middle"
            fill="white"
            fontSize="8"
            opacity="0.7"
          >
            2
          </text>
          <text
            x="77.5"
            y="35"
            textAnchor="middle"
            fill="white"
            fontSize="8"
            opacity="0.7"
          >
            3
          </text>

          {/* Pointer */}
          <path
            d="M47.5 65 L52.5 60 L57.5 65"
            fill="url(#arrayGrad4)"
            className="animate-bounce-subtle"
          />
        </g>
        <defs>
          <linearGradient id="arrayGrad1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="arrayGrad2">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
          <linearGradient id="arrayGrad3">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="arrayGrad4">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
      </svg>
    ),
  };

  return icons[variant];
}

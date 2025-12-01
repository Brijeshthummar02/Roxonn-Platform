import React, { lazy, Suspense } from "react";
import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { NotificationProvider } from "@/components/ui/notification";
import { NavigationBar } from "@/components/navigation-bar";
import { ThemeProvider } from "@/components/theme-provider";
import { ContributionDemo } from "@/components/contribution-demo";
import { ChatWidget } from "@/components/chat-widget";
import { PoolManagerWelcomeGuide } from "@/components/pool-manager-guide";
import { FundingDemo } from "@/components/funding-demo";
import { Loader2 } from "lucide-react";

const NotFound = lazy(() => import("@/pages/not-found"));
const AuthPage = lazy(() => import("@/pages/auth-page"));
const RepoDetailsPage = lazy(() => import("@/pages/repo-details-page"));
const AiScopingAgentPage = lazy(() => import("@/pages/ai-scoping-agent-page"));
const ProfilePage = lazy(() => import("@/pages/profile-page"));
const ProviderHubPage = lazy(() => import("@/pages/provider-hub-page"));
const DecentralizedChatPage = lazy(() => import("@/pages/decentralized-chat-page"));
const FAQPage = lazy(() => import("@/pages/faq-page"));
const RepoRoxonnPage = lazy(() => import("@/pages/RepoRoxonnPage"));
const CoursesPage = lazy(() => import("@/pages/courses-page"));
const BoltNewCoursePage = lazy(() => import("@/pages/bolt-new"));
const V0DevCoursePage = lazy(() => import("@/pages/v0-dev"));
const ReferralsPage = lazy(() => import("@/pages/referrals-page"));
const LandingPage = lazy(() => import("@/pages/landing-page"));
const DashboardPage = lazy(() => import("@/pages/dashboard-page"));
const ReposExplorerPage = lazy(() => import("@/pages/repos-explorer-page"));
const WalletNewPage = lazy(() => import("@/pages/wallet-new-page"));
const ContributionsPage = lazy(() => import("@/pages/contributions-page"));
const MembershipNewPage = lazy(() => import("@/pages/membership-new-page"));
const VSCodeWalletPage = lazy(() => import("@/pages/vscode-wallet-page"));
const MyRepositories = lazy(() => import("@/components/my-repositories").then(m => ({ default: m.MyRepositories })));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  );
}

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary/70" />
      </div>
    );
  }

  // Show guide components based on user role
  const showGuides = !loading && user;

  console.log('[Router Render] Loading finished. User Role:', user?.role);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main content */}
      <div className="relative z-10 flex-1">
        <NavigationBar />
        {showGuides && (
          <>
            {/* Show appropriate guide based on user role */}
            {user?.role === "contributor" && <ContributionDemo />}
            {user?.role === "poolmanager" && <PoolManagerWelcomeGuide />}
            {user?.role === "poolmanager" && <FundingDemo />}
          </>
        )}
        <Suspense fallback={<PageLoader />}>
          <Switch>
            {/* Root - Landing for guests, Dashboard for users */}
            <Route path="/">
              {user ? <Redirect to="/dashboard" /> : <LandingPage />}
            </Route>

            {/* Auth routes */}
            <Route path="/auth/signin" component={AuthPage} />
            <Route path="/auth" component={AuthPage} />

            {/* VSCode wallet */}
            <Route path="/vscode/wallet" component={VSCodeWalletPage} />

            {/* Main app routes */}
            <Route path="/dashboard" component={DashboardPage} />
            <Route path="/repos" component={ReposExplorerPage} />
            <Route path="/repos/:owner/:name" component={RepoDetailsPage} />
            <Route path="/wallet" component={WalletNewPage} />
            <Route path="/contributions" component={ContributionsPage} />
            <Route path="/membership" component={MembershipNewPage} />
            <Route path="/referrals" component={ReferralsPage} />
            <Route path="/profile" component={ProfilePage} />

            {/* Pool Manager routes */}
            <Route path="/my-repos">
              {() => {
                console.log('[Route /my-repos] Evaluating. User Role:', user?.role);
                if (!user) {
                  return <Redirect to="/repos" />;
                }
                if (user.role === 'poolmanager') {
                  return <MyRepositories />;
                }
                return <Redirect to="/repos" />;
              }}
            </Route>

            {/* Feature routes */}
            <Route path="/provider-hub" component={ProviderHubPage} />
            <Route path="/decentralized-chat" component={DecentralizedChatPage} />
            <Route path="/ai-scoping-agent" component={AiScopingAgentPage} />
            <Route path="/faq" component={FAQPage} />

            {/* Courses */}
            <Route path="/courses" component={CoursesPage} />
            <Route path="/courses/bolt-new" component={BoltNewCoursePage} />
            <Route path="/courses/v0-dev" component={V0DevCoursePage} />

            {/* Dynamic repo route - must come AFTER specific routes */}
            <Route path="/:owner/:repo" component={RepoRoxonnPage} />

            {/* 404 */}
            <Route path="*" component={NotFound} />
          </Switch>
        </Suspense>
      </div>
    </div>
  );
}

function App() {
  const [location] = useLocation();
  const showChatWidget = location !== '/ai-scoping-agent';

  return (
    <ThemeProvider defaultTheme="dark" storageKey="github-identity-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NotificationProvider>
            <Router />
            <Toaster />
            <ContributionDemo />
            {showChatWidget && <ChatWidget />}
          </NotificationProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

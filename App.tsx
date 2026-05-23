import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AnimatedBackground from "@/components/AnimatedBackground";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Home from "@/pages/Home";
import Reader from "@/pages/Reader";
import Bookmark from "@/pages/Bookmark";
import Juz from "@/pages/Juz";
import Community from "@/pages/Community";
import Quiz from "@/pages/Quiz";
import Progress from "@/pages/Progress";
import Prayer from "@/pages/Prayer";
import AISearch from "@/pages/AISearch";
import Ramadan from "@/pages/Ramadan";
import Learn from "@/pages/Learn";
import Journey from "@/pages/Journey";
import Healing from "@/pages/Healing";
import Rank from "@/pages/Rank";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/read/:surahId" component={Reader} />
      <Route path="/bookmark" component={Bookmark} />
      <Route path="/juz" component={Juz} />
      <Route path="/community" component={Community} />
      <Route path="/quiz" component={Quiz} />
      <Route path="/progress" component={Progress} />
      <Route path="/prayer" component={Prayer} />
      <Route path="/ai-search" component={AISearch} />
      <Route path="/ramadan" component={Ramadan} />
      <Route path="/learn" component={Learn} />
      <Route path="/journey" component={Journey} />
      <Route path="/healing" component={Healing} />
      <Route path="/rank" component={Rank} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AnimatedBackground />
          <Navbar />
          <main>
            <Router />
          </main>
          <BottomNav />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

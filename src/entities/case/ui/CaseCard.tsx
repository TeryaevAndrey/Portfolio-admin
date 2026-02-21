import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter } from "@/shared/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/ui/carousel";
import type { HTMLAttributes } from "react";
import type { Case } from "../model/types";
import { Text } from "@/shared/ui/text";
import { Button } from "@/shared/ui/button";
import { RemoveCaseButton } from "@/features/remove-case";

interface Props extends HTMLAttributes<HTMLDivElement> {
  data: Case;
}

export const CaseCard = ({ className, data }: Props) => {
  return (
    <Card className={cn(className)}>
      <CardContent>
        <Carousel>
          <CarouselContent>
            {data.images.map((image, index) => (
              <CarouselItem key={index}>
                <img
                  className="object-cover w-full"
                  src={`${import.meta.env.VITE_API_URL}/uploads/${image}`}
                  alt={`image-${index}`}
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>

        <div className="flex flex-col gap-1 mt-4">
          <Text size="default" weight="semibold" color="foreground">
            {data.title}
          </Text>
          {data.description && (
            <Text size="sm" color="foreground">
              {data.description}
            </Text>
          )}
        </div>
      </CardContent>

      <CardFooter className="justify-between mt-auto">
        {data.link && (
          <Button className="p-0" variant="link" asChild>
            <a href={data.link}>DEMO</a>
          </Button>
        )}

        <RemoveCaseButton className="ml-auto" caseId={data.id} />
      </CardFooter>
    </Card>
  );
};

import mongoose, { Document, Schema } from 'mongoose';

export type Category = 'Electrical' | 'Water' | 'Internet' | 'Infrastructure';
export type IssueStatus = 'Open' | 'In Progress' | 'Resolved';

export interface IRemark {
  text: string;
  addedBy: mongoose.Types.ObjectId;
  addedAt: Date;
}

export interface IIssue extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: Category;
  status: IssueStatus;
  imageUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  remarks: IRemark[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

const remarkSchema = new Schema<IRemark>(
  {
    text: {
      type: String,
      required: [true, 'Remark text is required'],
      trim: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Remark author is required'],
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const issueSchema = new Schema<IIssue>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['Electrical', 'Water', 'Internet', 'Infrastructure'],
        message: 'Category must be one of: Electrical, Water, Internet, Infrastructure',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['Open', 'In Progress', 'Resolved'],
        message: 'Status must be one of: Open, In Progress, Resolved',
      },
      default: 'Open',
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    remarks: {
      type: [remarkSchema],
      default: [],
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Update resolvedAt when status changes to Resolved
issueSchema.pre('save', function () {
  if (this.isModified('status') && this.status === 'Resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
});

export const Issue = mongoose.model<IIssue>('Issue', issueSchema);
